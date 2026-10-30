'use client'

import { useCallback, useRef, useState } from 'react'
import { useStore } from '../store/useStore'

export function MapAlignmentPanel() {
  const mapLonOffset = useStore(s => s.mapLonOffset)
  const setMapLonOffset = useStore(s => s.setMapLonOffset)
  const mapScale = useStore(s => s.mapScale)
  const setMapScale = useStore(s => s.setMapScale)
  const mapDebugGuides = useStore(s => s.mapDebugGuides)
  const setMapDebugGuides = useStore(s => s.setMapDebugGuides)

  // Panel drag
  const dragOrigin = useRef<{ mx: number; my: number; px: number; py: number } | null>(null)
  const [pos, setPos] = useState({ x: 16, y: 80 })

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    dragOrigin.current = { mx: e.clientX, my: e.clientY, px: pos.x, py: pos.y }
    const onMove = (ev: MouseEvent) => {
      if (!dragOrigin.current) return
      setPos({
        x: dragOrigin.current.px + ev.clientX - dragOrigin.current.mx,
        y: dragOrigin.current.py + ev.clientY - dragOrigin.current.my,
      })
    }
    const onUp = () => {
      dragOrigin.current = null
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }, [pos])

  return (
    <div className="fixed z-50 select-none" style={{ left: pos.x, top: pos.y, width: 252 }}>
      <div className="rounded-lg border border-white/10 bg-black backdrop-blur-lg text-white text-xs overflow-hidden shadow-xl">

        {/* Drag handle */}
        <div
          className="flex items-center justify-between px-3 py-2 cursor-grab active:cursor-grabbing border-b border-white/10"
          onMouseDown={onMouseDown}
        >
          <span className="font-mono uppercase tracking-widest text-[10px] text-white/50">
            Map Alignment
          </span>
          <svg className="w-3 h-3 text-white/30" viewBox="0 0 12 12" fill="currentColor">
            <rect x="1" y="2" width="10" height="1.5" rx="1" />
            <rect x="1" y="5.25" width="10" height="1.5" rx="1" />
            <rect x="1" y="8.5" width="10" height="1.5" rx="1" />
          </svg>
        </div>

        <div className="px-3 py-3 space-y-4">

          {/* Longitude offset */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-white/50 font-mono">Lon offset</span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min={-180} max={180} step={0.5}
                  value={mapLonOffset}
                  onChange={e => setMapLonOffset(Number(e.target.value))}
                  className="w-16 bg-white/5 border border-white/10 rounded px-1.5 py-0.5 text-right font-mono text-cyan-400 focus:outline-none focus:border-cyan-500/50"
                />
                <span className="text-white/30">°</span>
              </div>
            </div>
            <input
              type="range" min={-180} max={180} step={0.5}
              value={mapLonOffset}
              onChange={e => setMapLonOffset(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>

          {/* Scale / radius */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-white/50 font-mono">Scale</span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min={0.7} max={1.1} step={0.005}
                  value={mapScale}
                  onChange={e => setMapScale(Number(e.target.value))}
                  className="w-16 bg-white/5 border border-white/10 rounded px-1.5 py-0.5 text-right font-mono text-cyan-400 focus:outline-none focus:border-cyan-500/50"
                />
                <span className="text-white/30 w-3" />
              </div>
            </div>
            <input
              type="range" min={0.7} max={1.1} step={0.005}
              value={mapScale}
              onChange={e => setMapScale(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>

          {/* Debug guides toggle */}
          <button
            onClick={() => setMapDebugGuides(!mapDebugGuides)}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded border transition-colors ${mapDebugGuides
              ? 'border-yellow-500/50 bg-yellow-500/10 text-yellow-300'
              : 'border-white/10 bg-white/5 text-white/40 hover:text-white/60'
              }`}
          >
            <span className="font-mono uppercase tracking-widest text-[10px]">Debug guides</span>
            <span className="flex items-center gap-2 text-[10px] font-mono">
              {mapDebugGuides && (
                <>
                  <span className="w-2 h-2 rounded-full bg-orange-400 inline-block" title="Africa" />
                  <span className="w-2 h-2 rounded-full bg-yellow-300 inline-block" title="Equator" />
                  <span className="w-2 h-2 rounded-full bg-green-400 inline-block" title="Prime meridian" />
                </>
              )}
              {mapDebugGuides ? 'ON' : 'OFF'}
            </span>
          </button>

          {mapDebugGuides && (
            <div className="text-[10px] font-mono text-white/30 space-y-0.5 leading-relaxed">
              <div><span className="text-orange-400">■</span> Africa — straddles 0° lat / 0° lon</div>
              <div><span className="text-yellow-300">■</span> Equator — lat 0°</div>
              <div><span className="text-green-400">■</span> Prime meridian — lon 0°</div>
            </div>
          )}

          {/* Reset */}
          <button
            onClick={() => { setMapLonOffset(89.9); setMapScale(0.8911) }}
            className="w-full text-center text-white/30 hover:text-white/60 font-mono text-[10px] uppercase tracking-widest transition-colors py-0.5 border-t border-white/5 pt-2"
          >
            Reset all
          </button>
        </div>
      </div>
    </div>
  )
}
