'use client'

import { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import { Activity, Zap, Target, X, Globe, Shield, Satellite } from 'lucide-react'
import { Asset } from '../types'
import { useStore } from '../store/useStore'
import { satelliteScreenPositions } from './Satellite'
import { getSatLatLon } from '../utils/geospatial'
import { getCountryOverhead, type CountryEntry } from '../data/countryCodes'

interface AssetDetailsProps {
    asset: Asset
    onClose: () => void
}

// Country/org → flag emoji (best-effort, fallback to globe)
function ownerFlag(owner: string | undefined): string {
    if (!owner) return '🛰️'
    const o = owner.toUpperCase()
    if (o.includes('USA') || o.includes('SPACEX') || o.includes('NASA') || o.includes('USSF') || o.includes('NRO')) return '🇺🇸'
    if (o.includes('RUSSIA') || o.includes('ROSCOSMOS')) return '🇷🇺'
    if (o.includes('CHINA') || o.includes('CNSA') || o.includes('PLA') || o.includes('CMA') || o.includes('CASC')) return '🇨🇳'
    if (o.includes('EUROPE') || o.includes('ESA') || o.includes('EUMETSAT') || o.includes('AIRBUS')) return '🇪🇺'
    if (o.includes('JAPAN') || o.includes('JAXA') || o.includes('JMA')) return '🇯🇵'
    if (o.includes('INDIA') || o.includes('ISRO')) return '🇮🇳'
    if (o.includes('UK') || o.includes('ONEWEB') || o.includes('INMARSAT') || o.includes('SURREY')) return '🇬🇧'
    if (o.includes('FRANCE') || o.includes('EUTELSAT') || o.includes('HISPASAT')) return '🇫🇷'
    if (o.includes('GERMANY') || o.includes('DLR')) return '🇩🇪'
    if (o.includes('CANADA') || o.includes('CSA')) return '🇨🇦'
    if (o.includes('SOUTH KOREA') || o.includes('KARI')) return '🇰🇷'
    if (o.includes('AUSTRALIA')) return '🇦🇺'
    if (o.includes('TURKEY') || o.includes('TÜRKIYE') || o.includes('TUA')) return '🇹🇷'
    if (o.includes('SAUDI') || o.includes('ARABSAT')) return '🇸🇦'
    if (o.includes('EGYPT') || o.includes('NILESAT')) return '🇪🇬'
    if (o.includes('MALAYSIA') || o.includes('MEASAT')) return '🇲🇾'
    if (o.includes('VIETNAM') || o.includes('VNPT')) return '🇻🇳'
    if (o.includes('UKRAINE')) return '🇺🇦'
    if (o.includes('LUXEMBOURG') || o.includes('SES') || o.includes('INTELSAT')) return '🇱🇺'
    if (o.includes('SPAIN') || o.includes('HISPASAT')) return '🇪🇸'
    return '🌐'
}

export function AssetDetails({ asset, onClose }: AssetDetailsProps) {
    const { setSelectedLiveSatNoradId, tleRecords, simulatedTimeOffset } = useStore()

    const [overheadCountry, setOverheadCountry] = useState<CountryEntry | undefined>()

    useEffect(() => {
        const record = tleRecords.find(r => `TLE-${r.noradId}` === asset.id)
        if (!record) return

        const updateOverhead = () => {
            const simTime = new Date(Date.now() + simulatedTimeOffset)
            const pos = getSatLatLon(record, simTime)
            if (pos) {
                setOverheadCountry(getCountryOverhead(pos.lat, pos.lon))
            }
        }

        updateOverhead()
        const interval = setInterval(updateOverhead, 5000)
        return () => clearInterval(interval)
    }, [asset.id, tleRecords, simulatedTimeOffset])

    if (!asset) return null

    const altitude = asset.orbit.semiMajorAxis - 6371
    const flag = ownerFlag(asset.owner)

    // Live screen-position tracking — reads from satelliteScreenPositions each frame
    // via rAF and drives motion values so the card follows the satellite smoothly
    // without triggering React re-renders.
    const rawX = useMotionValue(-9999)
    const rawY = useMotionValue(-9999)
    const springX = useSpring(rawX, { stiffness: 260, damping: 28 })
    const springY = useSpring(rawY, { stiffness: 260, damping: 28 })

    useEffect(() => {
        const id = asset.id
        let raf: number
        const tick = () => {
            const pos = satelliteScreenPositions.get(id)
            if (pos) {
                rawX.set(pos.x + 20)
                rawY.set(pos.y)
            }
            raf = requestAnimationFrame(tick)
        }
        raf = requestAnimationFrame(tick)
        return () => cancelAnimationFrame(raf)
    }, [asset.id, rawX, rawY])

    const handleClose = () => {
        setSelectedLiveSatNoradId(null)
        onClose()
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed z-50 w-72 pointer-events-auto top-0 left-0"
            style={{ x: springX, y: springY, translateY: '-50%' }}
        >
            <div className="bg-zinc-900/40 backdrop-blur-xs border border-white/10 rounded-4xl shadow-2xl overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-4 flex items-start justify-between">
                    <div className="flex flex-col gap-0.5 flex-1 min-w-0 pr-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-base">{flag}</span>
                            <h2 className="text-sm font-bold text-zinc-100 tracking-tight truncate mt-1">
                                {asset.name}
                            </h2>
                            {asset.isMilitary && (
                                <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-red-500/20 text-red-400 border border-red-500/30">
                                    <Shield className="w-2.5 h-2.5" /> MIL
                                </span>
                            )}
                        </div>
                        <span className="text-[10px] font-mono text-cyan-400">
                            NORAD {asset.id.replace('TLE-', '')}
                        </span>

                        {/* Country code badge */}
                        {asset.countryCode && (
                            <span className="text-[10px] font-mono text-cyan-300/80 flex items-center gap-1 mt-0.5">
                                <span className="px-1.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-[9px] font-bold uppercase tracking-wider">
                                    {asset.countryCode}
                                </span>
                            </span>
                        )}

                        {/* Owner */}
                        {asset.owner && (
                            <span className="text-[10px] font-mono text-zinc-400 flex items-center gap-1 mt-0.5">
                                <Globe className="w-2.5 h-2.5 shrink-0" />
                                {asset.owner}
                            </span>
                        )}

                        {/* Mission type */}
                        {asset.missionType && (
                            <span className="text-[10px] font-mono text-zinc-400 flex items-center gap-1">
                                <Satellite className="w-2.5 h-2.5 shrink-0" />
                                {asset.missionType}
                            </span>
                        )}

                        {/* Mission objective override */}
                        {asset.missionObjective && (
                            <span className="text-[10px] font-mono text-zinc-500 flex items-center gap-1">
                                <Target className="w-2.5 h-2.5 shrink-0" />
                                {asset.missionObjective}
                            </span>
                        )}

                        {/* Overhead Country */}
                        {overheadCountry && (
                            <span className="text-[10px] font-mono text-cyan-400 flex items-center gap-1 mt-1 bg-cyan-500/10 px-1.5 py-0.5 rounded w-fit border border-cyan-500/20">
                                <Globe className="w-2.5 h-2.5 shrink-0" />
                                Currently above: {overheadCountry.name}
                            </span>
                        )}
                    </div>
                    <button
                        onClick={handleClose}
                        className="p-1.5 rounded-full hover:bg-white/10 text-zinc-400 hover:text-zinc-200 transition-colors shrink-0"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Object type badge */}
                <div className="px-4 pb-2">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                        asset.type === 'debris'
                            ? 'bg-zinc-700/50 text-zinc-400 border border-zinc-600/40'
                            : 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/25'
                    }`}>
                        {asset.type === 'debris' ? '⚠ Debris' : '● Active Satellite'}
                    </span>
                </div>

                {/* Content */}
                <div className="p-4 pt-2 flex flex-col gap-5">
                    {/* Orbital Parameters */}
                    <div className="flex flex-col gap-3">
                        <span className="text-[10px] font-mono tracking-widest uppercase text-zinc-400 flex items-center gap-1.5">
                            <Activity className="w-3 h-3" /> Orbital Parameters
                        </span>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-0.5">
                                <span className="text-[10px] text-zinc-400 font-mono">ALTITUDE</span>
                                <span className="text-xs font-bold text-zinc-200">{altitude.toFixed(0)} km</span>
                            </div>
                            <div className="flex flex-col gap-0.5">
                                <span className="text-[10px] text-zinc-400 font-mono">INCLINATION</span>
                                <span className="text-xs font-bold text-zinc-200">{asset.orbit.inclination.toFixed(1)}°</span>
                            </div>
                            <div className="flex flex-col gap-0.5">
                                <span className="text-[10px] text-zinc-400 font-mono">PERIOD</span>
                                <span className="text-xs font-bold text-zinc-200">{asset.orbit.period.toFixed(1)} min</span>
                            </div>
                            <div className="flex flex-col gap-0.5">
                                <span className="text-[10px] text-zinc-400 font-mono">RAAN</span>
                                <span className="text-xs font-bold text-zinc-200">{asset.orbit.raan.toFixed(1)}°</span>
                            </div>
                        </div>
                    </div>

                    {/* Propulsion Details */}
                    {asset.type !== 'debris' && (
                        <div className="flex flex-col gap-3">
                            <span className="text-[10px] font-mono tracking-widest uppercase text-zinc-400 flex items-center gap-1.5">
                                <Zap className="w-3 h-3" /> Propulsion
                            </span>

                            <div className="flex flex-col gap-2.5">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] text-zinc-400 font-mono uppercase">Status</span>
                                    <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">Nominal</span>
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
                                        <span>Fuel Level</span>
                                        <span>74%</span>
                                    </div>
                                    <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-cyan-500 w-[74%] shadow-[0_0_8px_rgba(0,229,255,0.4)]" />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] text-zinc-400 font-mono uppercase">Remaining ΔV</span>
                                    <span className="text-xs font-bold text-zinc-200 italic">{asset.deltaVBudget.toFixed(1)} m/s</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    )
}
