'use client'

import { useMemo, useEffect } from 'react'
import { Search, X, Radio, Globe } from 'lucide-react'
import { useStore } from '../store/useStore'
import { tleToAsset } from '../utils/tleToAsset'
import { parseTle, propagateEci } from '../lib/sgp4'
import { eciToLatLon, isOverBbox, getSatLatLon } from '../utils/geospatial'
import { findCountry, getCountryOverhead } from '../data/countryCodes'
import type { Asset, TleRecord } from '../types'

// ─── Country code → flag emoji ────────────────────────────────────────────────
function codeToFlag(code: string | undefined): string {
  if (!code) return '🛰️'
  const c = code.toUpperCase()
  if (['US', 'USA', 'AB', 'ORB'].includes(c)) return '🇺🇸'  // SpaceX, etc. often US
  if (c === 'US') return '🇺🇸'
  if (['CIS', 'RUS', 'SU'].includes(c)) return '🇷🇺'
  if (['PRC', 'CN', 'CHN'].includes(c)) return '🇨🇳'
  if (['FR', 'FRA'].includes(c)) return '🇫🇷'
  if (['UK', 'GB', 'GBR'].includes(c)) return '🇬🇧'
  if (['D', 'DEU', 'GER'].includes(c)) return '🇩🇪'
  if (['JPN', 'JP'].includes(c)) return '🇯🇵'
  if (['IND', 'IN'].includes(c)) return '🇮🇳'
  if (['ISRL', 'IL', 'ISR'].includes(c)) return '🇮🇱'
  if (['BRA', 'BR'].includes(c)) return '🇧🇷'
  if (['KOR', 'ROK', 'KR'].includes(c)) return '🇰🇷'
  if (['UAE', 'AE'].includes(c)) return '🇦🇪'
  if (['AUS', 'AU'].includes(c)) return '🇦🇺'
  if (['CA', 'CAN'].includes(c)) return '🇨🇦'
  if (['I', 'ITA', 'IT'].includes(c)) return '🇮🇹'
  if (['E', 'ESP', 'ES'].includes(c)) return '🇪🇸'
  if (['NOR', 'NO'].includes(c)) return '🇳🇴'
  if (['SWE', 'S', 'SE'].includes(c)) return '🇸🇪'
  if (['NL', 'NLD'].includes(c)) return '🇳🇱'
  if (['LUX', 'LU'].includes(c)) return '🇱🇺'
  if (['ARGN', 'AR', 'ARG'].includes(c)) return '🇦🇷'
  if (['PAKI', 'PK', 'PAK'].includes(c)) return '🇵🇰'
  if (['TURK', 'TR', 'TUR'].includes(c)) return '🇹🇷'
  if (['SAUD', 'SA', 'SAU'].includes(c)) return '🇸🇦'
  if (['UKRA', 'UA', 'UKR'].includes(c)) return '🇺🇦'
  if (['EGYP', 'EG', 'EGY'].includes(c)) return '🇪🇬'
  if (['IRAN', 'IR', 'IRN'].includes(c)) return '🇮🇷'
  if (['MEX', 'MX'].includes(c)) return '🇲🇽'
  if (['INDO', 'ID', 'IDN'].includes(c)) return '🇮🇩'
  if (['ESA', 'EU', 'EUTE'].includes(c)) return '🇪🇺'
  return '🛰️'
}


// ─── Individual satellite row ─────────────────────────────────────────────────
interface SatRowProps {
  record: TleRecord
  asset: Asset
  isSelected: boolean
  isOverhead?: boolean
  onSelect: () => void
}

function SatRow({ record, asset, isSelected, isOverhead, onSelect }: SatRowProps) {
  const flag = codeToFlag(record.countryCode)
  const pos = getSatLatLon(record)
  const overheadCountry = pos ? getCountryOverhead(pos.lat, pos.lon) : undefined

  return (
    <button
      onClick={onSelect}
      className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors border ${
        isSelected
          ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-100'
          : 'hover:bg-white/5 border-transparent text-zinc-300 hover:border-zinc-700/50'
      }`}
    >
      <div className="flex items-start gap-2">
        <span className="text-base leading-none mt-0.5 shrink-0">{flag}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium truncate">{asset.name}</span>
            {isOverhead && (
              <span className="shrink-0 flex items-center gap-0.5 px-1 py-0.5 rounded text-[8px] font-bold uppercase bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                <Radio className="w-2 h-2" /> LIVE
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[10px] font-mono text-zinc-500">
              NORAD {record.noradId}
            </span>
            {record.countryCode && (
              <span className="text-[10px] font-mono text-zinc-600 uppercase">
                {record.countryCode}
              </span>
            )}
          </div>
          {asset.missionType && asset.missionType !== 'Unknown' && (
            <div className="text-[10px] font-mono text-zinc-600 mt-0.5 truncate">
              {asset.missionType}
            </div>
          )}
          {overheadCountry && (
            <div className="text-[10px] font-mono text-cyan-500/80 mt-0.5 truncate flex items-center gap-1">
              <Globe className="w-2.5 h-2.5 shrink-0" />
              Above: {overheadCountry.name}
            </div>
          )}
        </div>
        {/* Live indicator dot */}
        <div className="shrink-0 mt-1">
          <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 opacity-60 animate-pulse" />
        </div>
      </div>
    </button>
  )
}

// ─── Main panel ───────────────────────────────────────────────────────────────
export function SatelliteIntelPanel() {
  const {
    tleRecords,
    tleLoading,
    tleError,
    selectedLiveSatNoradId,
    setSelectedLiveSatNoradId,
    setSelectedAsset,
    searchQuery,
    setSearchQuery,
    setHighlightedCountryCode,
  } = useStore()

  // Detect country match from query
  const matchedCountry = useMemo(() => {
    if (!searchQuery.trim()) return null
    return findCountry(searchQuery)
  }, [searchQuery])

  // Update store when country match changes
  useEffect(() => {
    if (matchedCountry) {
      setHighlightedCountryCode(matchedCountry.codes[0])
    } else {
      setHighlightedCountryCode(null)
    }
  }, [matchedCountry, setHighlightedCountryCode])

  // Convert TLE records to assets (memoized)
  const assets = useMemo(() => {
    return tleRecords.map(r => tleToAsset(r))
  }, [tleRecords])

  // Country mode: satellites owned by the matched country
  const countrySats = useMemo(() => {
    if (!matchedCountry) return []
    const codes = new Set(matchedCountry.codes.map(c => c.toUpperCase()))
    return tleRecords
      .map((r, i) => ({ record: r, asset: assets[i] }))
      .filter(({ record }) => record.countryCode && codes.has(record.countryCode.toUpperCase()))
  }, [matchedCountry, tleRecords, assets])

  // Overhead satellites for matched country (computed once on search)
  const overheadSats = useMemo(() => {
    if (!matchedCountry) return new Set<number>()
    const { bbox } = matchedCountry
    const overhead = new Set<number>()
    for (const record of tleRecords) {
      const pos = getSatLatLon(record)
      if (pos && isOverBbox(pos.lat, pos.lon, bbox)) {
        overhead.add(record.noradId)
      }
    }
    return overhead
  }, [matchedCountry, tleRecords])

  // Non-country filter: name or NORAD ID search
  const filteredSats = useMemo(() => {
    if (matchedCountry || !searchQuery.trim()) {
      return tleRecords
        .map((r, i) => ({ record: r, asset: assets[i] }))
        .slice(0, 100)
    }
    const q = searchQuery.toLowerCase()
    return tleRecords
      .map((r, i) => ({ record: r, asset: assets[i] }))
      .filter(({ record, asset }) =>
        asset.name.toLowerCase().includes(q) ||
        String(record.noradId).includes(q) ||
        (record.countryCode ?? '').toLowerCase().includes(q)
      )
      .slice(0, 100)
  }, [searchQuery, matchedCountry, tleRecords, assets])

  const handleSelect = (record: TleRecord, asset: Asset) => {
    setSelectedLiveSatNoradId(record.noradId)
    setSelectedAsset(asset)
  }

  const handleClear = () => {
    setSearchQuery('')
    setHighlightedCountryCode(null)
  }

  return (
    <div className="flex flex-col h-full w-full md:w-64 gap-2">
      {/* Branding */}
      <div className="hidden md:block mb-1">
        <h1 className="text-sm font-black tracking-[0.2em] text-white/90 uppercase font-mono">
          Telescope
        </h1>
        <div className="h-0.5 w-8 bg-cyan-500 mt-1" />
      </div>

      {/* Search — hidden on mobile as we have the bottom bar */}
      <div className="hidden md:flex items-center border border-zinc-700 rounded-full overflow-hidden w-full" style={{ height: 32 }}>
        <div className="flex items-center gap-2 px-3 h-8 whitespace-nowrap w-full">
          <Search className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => { if (e.key === 'Escape') handleClear() }}
            placeholder="Name, NORAD ID, or country..."
            className="bg-transparent text-xs text-zinc-100 outline-none flex-1 min-w-0 placeholder:text-zinc-500"
          />
          {searchQuery && (
            <button
              onClick={handleClear}
              className="ml-auto text-zinc-500 hover:text-zinc-300 transition-colors shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Results list */}
      <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-px">
        {tleError && (
          <div className="py-3 text-[10px] font-mono text-red-400 px-1">
            Error: {tleError}
          </div>
        )}

        {tleLoading && tleRecords.length === 0 && (
          <div className="py-8 text-center">
            <div className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest animate-pulse">
              Fetching satellite data...
            </div>
          </div>
        )}

        {!tleLoading && tleRecords.length === 0 && !tleError && (
          <div className="py-8 text-center">
            <div className="text-[10px] font-mono text-zinc-700 uppercase tracking-widest">
              No data available
            </div>
          </div>
        )}

        {/* Country mode */}
        {matchedCountry && tleRecords.length > 0 && (
          <>
            {/* Country header */}
            <div className="flex items-center gap-2 py-2 mb-1">
              <Globe className="w-3 h-3 text-cyan-400" />
              <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest">
                {matchedCountry.name}
              </span>
              <span className="ml-auto text-[9px] font-mono text-zinc-600">
                {countrySats.length} owned
              </span>
            </div>

            {/* Currently overhead */}
            {overheadSats.size > 0 && (
              <>
                <div className="flex items-center gap-1.5 py-1.5 mb-1">
                  <Radio className="w-2.5 h-2.5 text-cyan-400" />
                  <span className="text-[9px] font-mono text-cyan-400/80 uppercase tracking-wider">
                    Currently overhead ({overheadSats.size})
                  </span>
                </div>
                {tleRecords
                  .filter(r => overheadSats.has(r.noradId))
                  .slice(0, 20)
                  .map((record, idx) => {
                    const asset = tleToAsset(record)
                    return (
                      <SatRow
                        key={`${record.noradId}-${idx}`}
                        record={record}
                        asset={asset}
                        isSelected={selectedLiveSatNoradId === record.noradId}
                        isOverhead
                        onSelect={() => handleSelect(record, asset)}
                      />
                    )
                  })
                }
                <div className="h-3" />
              </>
            )}

            {/* Owned by country */}
            {countrySats.length > 0 && (
              <>
                <div className="flex items-center gap-1.5 py-1.5 mb-1">
                  <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider">
                    Owned satellites
                  </span>
                </div>
                {countrySats.map(({ record, asset }, idx) => (
                  <SatRow
                    key={`${record.noradId}-${idx}`}
                    record={record}
                    asset={asset}
                    isSelected={selectedLiveSatNoradId === record.noradId}
                    isOverhead={overheadSats.has(record.noradId)}
                    onSelect={() => handleSelect(record, asset)}
                  />
                ))}
              </>
            )}

            {countrySats.length === 0 && overheadSats.size === 0 && (
              <div className="py-4 text-[10px] font-mono text-zinc-700 text-center">
                No satellites found for {matchedCountry.name} in current catalog
              </div>
            )}
          </>
        )}

        {/* Standard search / browse mode */}
        {!matchedCountry && tleRecords.length > 0 && (
          <>
            {searchQuery.trim() && filteredSats.length === 0 && (
              <div className="py-4 text-[10px] font-mono text-zinc-700 text-center uppercase tracking-widest">
                No results for &ldquo;{searchQuery}&rdquo;
              </div>
            )}
            {!searchQuery.trim() && (
              <div className="flex items-center gap-1.5 py-1.5 mb-1">
                <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-wider">
                  All objects — {tleRecords.length} total
                </span>
              </div>
            )}
            {searchQuery.trim() && filteredSats.length > 0 && (
              <div className="flex items-center gap-1.5 py-1.5 mb-1">
                <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-wider">
                  {filteredSats.length} result{filteredSats.length !== 1 ? 's' : ''}
                </span>
              </div>
            )}
            {filteredSats.map(({ record, asset }, idx) => (
              <SatRow
                key={`${record.noradId}-${idx}`}
                record={record}
                asset={asset}
                isSelected={selectedLiveSatNoradId === record.noradId}
                onSelect={() => handleSelect(record, asset)}
              />
            ))}
          </>
        )}
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #3f3f46; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #52525b; }
      `}</style>
    </div>
  )
}
