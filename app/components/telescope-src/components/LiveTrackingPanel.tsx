'use client'

import { useState, useMemo, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Radio, Globe } from 'lucide-react'
import { useStore } from '../store/useStore'
import { tleToAsset } from '../utils/tleToAsset'
import { getCountryCodes } from '../data/countryCodes'
import type { TleCategory } from '../types'

const CATEGORIES: { value: TleCategory; label: string }[] = [
  { value: 'stations', label: 'Stations' },
  { value: 'visual',   label: 'Visual'   },
  { value: 'active',   label: 'Active'   },
  { value: 'debris',   label: 'Debris'   },
  { value: 'analyst',  label: 'Analyst'  },
  { value: 'starlink', label: 'Starlink' },
]

export function LiveTrackingPanel() {
  const {
    tleRecords,
    tleCategory,
    tleLoading,
    tleError,
    selectedLiveSatNoradId,
    setTleCategory,
    setSelectedLiveSatNoradId,
    searchQuery,
    setSearchQuery,
  } = useStore()

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return tleRecords
    const q = searchQuery.toLowerCase()
    
    // Map country name queries to their official CelesTrak codes
    // e.g. "china" -> ["PRC", "CN", "CHN"]
    const relatedCodes = getCountryCodes(q).map(c => c.toLowerCase())

    return tleRecords.filter((r) => {
      const asset = tleToAsset(r)
      const nameMatch = r.name.toLowerCase().includes(q)
      const idMatch = String(r.noradId).includes(q)
      const ownerMatch = asset.owner?.toLowerCase().includes(q)
      const missionMatch = asset.missionType?.toLowerCase().includes(q)
      const codeMatch = r.countryCode ? r.countryCode.toLowerCase().includes(q) : false
      
      // Match if the satellite's code belongs to the country name searched
      const countryNameMatch = r.countryCode ? relatedCodes.includes(r.countryCode.toLowerCase()) : false
      
      return nameMatch || idMatch || ownerMatch || missionMatch || codeMatch || countryNameMatch
    })
  }, [tleRecords, searchQuery])

  // Clear selection if they start typing a search query to avoid confusion
  // (e.g. searching "china" while a Russian satellite popup is still open)
  useEffect(() => {
    if (searchQuery.trim().length > 0 && selectedLiveSatNoradId) {
      setSelectedLiveSatNoradId(null)
    }
  }, [searchQuery, selectedLiveSatNoradId, setSelectedLiveSatNoradId])

  return (
    <div className="flex flex-col gap-3 flex-1 min-h-0">

      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <span className="text-[10px] font-mono tracking-widest uppercase text-zinc-100 flex items-center gap-1.5">
          <Radio className="w-3 h-3 text-cyan-400" />
          Live Tracking
        </span>
        <span className="text-[10px] font-mono text-zinc-500">
          {tleLoading ? (
            <span className="text-cyan-400 animate-pulse">fetching…</span>
          ) : tleError ? (
            <span className="text-red-400">error</span>
          ) : (
            <>{filtered.length} / {tleRecords.length}</>
          )}
        </span>
      </div>

      {/* Category pills */}
      <div className="flex flex-wrap gap-1">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setTleCategory(cat.value)}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-mono tracking-widest uppercase transition-all ${
              tleCategory === cat.value
                ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/40'
                : 'bg-white/5 text-zinc-500 border border-white/8 hover:text-zinc-300 hover:border-white/15'
            }`}
          >
            {cat.label}
          </button>
        ))}
        <div className="relative">
          <input
            type="text"
            placeholder="Search satellites..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-all pl-10"
          />
        </div>
      </div>

      {/* Error state */}
      {tleError && (
        <div className="px-3 py-4 rounded-xl border border-dashed border-red-500/20 text-center">
          <span className="text-[10px] font-mono text-red-400">{tleError}</span>
        </div>
      )}

      {/* Satellite list */}
      {!tleError && (
        <div className="flex-1 overflow-y-auto min-h-0 flex flex-col gap-px pr-0.5 custom-scrollbar">
          {tleLoading && tleRecords.length === 0 ? (
            <div className="flex flex-col gap-2 pt-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-10 rounded-xl bg-white/3 animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="px-3 py-6 rounded-xl border border-dashed border-zinc-800 text-center">
              <span className="text-[10px] font-mono text-zinc-600 uppercase">No results</span>
            </div>
          ) : (
            <>
              {filtered.slice(0, 300).map((sat, idx) => {
                const isSelected = sat.noradId === selectedLiveSatNoradId
                const owner = tleToAsset(sat).owner
                return (
                  <motion.button
                    key={`${sat.noradId}-${idx}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={() => setSelectedLiveSatNoradId(isSelected ? null : sat.noradId)}
                    className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center justify-between gap-2 border transition-all ${
                      isSelected
                        ? 'bg-cyan-500/8 border-cyan-500/30 shadow-[0_0_12px_rgba(0,229,255,0.04)]'
                        : 'border-transparent hover:bg-white/4 hover:border-white/8'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className={`text-xs truncate font-medium ${isSelected ? 'text-cyan-300' : 'text-zinc-200'}`}>
                        {sat.name}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-mono text-zinc-600">
                          NORAD {sat.noradId}
                        </span>
                        {owner && (
                          <span className="text-[10px] font-mono text-cyan-500/70 truncate flex items-center gap-1">
                            <Globe className="w-2.5 h-2.5 shrink-0" />
                            {owner}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-[10px] font-mono text-zinc-700 shrink-0 tabular-nums">
                      {new Date(sat.epoch).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                    </div>
                  </motion.button>
                )
              })}

              {filtered.length > 300 && (
                <p className="text-[10px] font-mono text-zinc-600 text-center py-3 uppercase tracking-widest">
                  {filtered.length - 300} more — refine search
                </p>
              )}
            </>
          )}
        </div>
      )}

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #3f3f46; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #52525b; }
      `}</style>
    </div>
  )
}
