"use client"

import { useMemo, useEffect } from "react"
import { AnimatePresence, m, motion } from "framer-motion"
import Earth from "./components/Earth"
import { StickyPointer } from "./components/Satellite"
import { AssetDetails } from "./components/AssetDetails"
import { SatelliteIntelPanel } from "./components/SatelliteIntelPanel"
import { SystemStatus } from "./components/SystemStatus"
import { TimeSlider } from "./components/TimeSlider"
import { useLiveTle } from "./hooks/useLiveTle"
import { ZoomControl } from "./components/ZoomControl"
import { useStore } from "./store/useStore"
import { Search, List, X, ExternalLink } from "lucide-react"
import Button from "../Button"
import { tleToAsset } from "./utils/tleToAsset"
import type { Asset } from "./types"

export default function Home() {
    const {
        selectedAsset,
        setSelectedAsset,
        setSelectedLiveSatNoradId,
        tleRecords,
        isSidebarOpen,
        setSidebarOpen,
        searchQuery,
        setSearchQuery,
    } = useStore()

    useLiveTle()

    // Close sidebar when an asset is selected
    useEffect(() => {
        if (selectedAsset) {
            setSidebarOpen(false)
        }
    }, [selectedAsset, setSidebarOpen])

    // Convert tleRecords to Asset array for StickyPointer
    const assets = useMemo<Asset[]>(() => {
        return tleRecords.map(r => tleToAsset(r))
    }, [tleRecords])

    return (
        <main className="relative min-h-[95vh] h-[95vh] w-full overflow-hidden">
            <StickyPointer
                assets={assets}
                onSelect={id => {
                    const noradId = parseInt(id.replace('TLE-', ''), 10)
                    const record = tleRecords.find(r => r.noradId === noradId)
                    if (record) {
                        const asset = tleToAsset(record)
                        setSelectedAsset(asset)
                        setSelectedLiveSatNoradId(noradId)
                    }
                }}
            />

            {/* Desktop Left panel — satellite intel */}
            <div className="hidden md:block absolute top-4 left-4 bottom-4 z-10 pointer-events-none">
                <div className="pointer-events-auto h-full">
                    <SatelliteIntelPanel />
                </div>
            </div>

            {/* Top Right Primary Button */}
            <div className="absolute top-4 right-4 z-[210] pointer-events-auto">
                <Button
                    variant="primary"
                    onClick={() => window.open("https://telescope.delanoy.fyi", "_blank", "noopener,noreferrer")}
                    IconTrailing={ExternalLink}
                >
                    telescope.delanoy.fyi
                </Button>
            </div>

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: '20%' }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: '20%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="md:hidden absolute inset-0 z-[60] bg-zinc-950/90 backdrop-blur-2xl p-4 pb-24 flex flex-col pointer-events-none"
                    >
                        <div className="flex-1 overflow-hidden pointer-events-auto">
                            <h1 className="text-lg font-black tracking-[0.2em] text-white uppercase font-mono">
                                Telescope
                            </h1>
                            <div className="h-1 w-12 bg-cyan-500 mt-1" />
                            <SatelliteIntelPanel />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 3D scene — full screen */}
            <m.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="absolute inset-0 z-0 overflow-hidden"
            >
                <Earth
                    onDeselect={() => {
                        setSelectedAsset(null)
                        setSelectedLiveSatNoradId(null)
                    }}
                />
            </m.div>

            {/* Selected satellite detail popup */}
            <AnimatePresence>
                {selectedAsset && (
                    <AssetDetails
                        asset={selectedAsset}
                        onClose={() => {
                            setSelectedAsset(null)
                            setSelectedLiveSatNoradId(null)
                        }}
                    />
                )}
            </AnimatePresence>

            {/* Bottom controls */}
            <div className="md:block hidden">
                <ZoomControl />
                <TimeSlider />
            </div>

            {/* Mobile specific controls */}
            <div className="md:hidden contents">
                <ZoomControl />
                <TimeSlider />

                {/* Mobile Bottom Bar: Search + Toggle */}
                <div className="absolute bottom-4 left-4 right-4 z-[70] flex items-center gap-3 pointer-events-auto">
                    {/* Search Pill */}
                    <div className="flex-1 flex items-center gap-3 bg-zinc-950/80 backdrop-blur-xl border border-white/10 px-4 py-2.5 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.8)] ring-1 ring-white/5">
                        <Search className="w-4 h-4 text-zinc-500 shrink-0" />
                        <input
                            type="text"
                            placeholder="Search satellites..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={() => setSidebarOpen(true)}
                            className="bg-transparent text-sm text-zinc-100 outline-none flex-1 placeholder:text-zinc-600"
                        />
                    </div>

                    {/* Toggle Button */}
                    <button
                        onClick={() => setSidebarOpen(!isSidebarOpen)}
                        className={`w-11 h-11 flex items-center justify-center rounded-full transition-all duration-300 shadow-lg ring-1 ${isSidebarOpen
                            ? 'bg-zinc-800 border-white/20 text-white ring-white/10'
                            : 'bg-zinc-950/80 backdrop-blur-xl border border-white/10 text-zinc-400 ring-white/5'
                            }`}
                    >
                        {isSidebarOpen ? <X className="w-5 h-5" /> : <List className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            <SystemStatus />
        </main>
    )
}
