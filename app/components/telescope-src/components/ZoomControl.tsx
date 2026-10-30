'use client'

import { useRef, useCallback } from 'react'
import { useStore } from '../store/useStore'

// ── Constants ──────────────────────────────────────────────────────────────
const ZOOM_MIN = 0.5
const ZOOM_MAX = 2.5
const TRACK_H = 200 // px

// Scale: Earth visual radius = 1.4 units = 6371 km
const KM_PER_VIS = 6371 / 1.4
// Default camera distance from Earth centre = 5 visual units
const CAM_VIS_DEFAULT = 5

// Convert cameraZoom → virtual altitude above Earth surface (km)
function zoomToAltKm(zoom: number): number {
  return (CAM_VIS_DEFAULT / zoom) * KM_PER_VIS - 6371
}

// Convert altitude (km) → cameraZoom
function altKmToZoom(altKm: number): number {
  return (CAM_VIS_DEFAULT * KM_PER_VIS) / (altKm + 6371)
}

// Track fraction: 0 = top (closest / max zoom), 1 = bottom (farthest / min zoom)
function zoomToFrac(zoom: number): number {
  return 1 - (zoom - ZOOM_MIN) / (ZOOM_MAX - ZOOM_MIN)
}

// Altitude tick marks shown on the slider
const TICKS: { altKm: number; label: string }[] = [
  { altKm: 3_000,  label: '3,000 km'  },
  { altKm: 10_000, label: '10,000 km' },
  { altKm: 20_000, label: '20,000 km' },
  { altKm: 35_786, label: '35,786 km' }, // GEO
]

function formatAlt(km: number): string {
  if (km >= 1000) return `${(km / 1000).toFixed(1)}K km`
  return `${Math.round(km)} km`
}

// ── Component ──────────────────────────────────────────────────────────────
export function ZoomControl() {
  const { cameraZoom, setCameraZoom } = useStore()
  const trackRef = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)
  const dragStartY = useRef(0)
  const dragStartZoom = useRef(1)

  const accent = '#00E5FF'

  const thumbFrac = zoomToFrac(cameraZoom)          // 0 at top, 1 at bottom
  const thumbY   = thumbFrac * TRACK_H              // px from top of track
  const altKm    = Math.round(zoomToAltKm(cameraZoom))

  // ── Drag handling ────────────────────────────────────────────────────────
  const onThumbMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    dragging.current    = true
    dragStartY.current  = e.clientY
    dragStartZoom.current = cameraZoom

    const onMove = (ev: MouseEvent) => {
      if (!dragging.current) return
      const dy = ev.clientY - dragStartY.current
      // dragging down (dy > 0) → lower zoom (farther); up → higher zoom (closer)
      const dZoom = -(dy / TRACK_H) * (ZOOM_MAX - ZOOM_MIN)
      const next  = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, dragStartZoom.current + dZoom))
      setCameraZoom(parseFloat(next.toFixed(3)))
    }

    const onUp = () => {
      dragging.current = false
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }, [cameraZoom, setCameraZoom])

  // Click anywhere on the track to jump
  const onTrackClick = useCallback((e: React.MouseEvent) => {
    if (!trackRef.current) return
    const rect = trackRef.current.getBoundingClientRect()
    const frac = (e.clientY - rect.top) / TRACK_H           // 0 top, 1 bottom
    const zoom = ZOOM_MAX - frac * (ZOOM_MAX - ZOOM_MIN)    // top = max zoom
    setCameraZoom(Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, parseFloat(zoom.toFixed(3)))))
  }, [setCameraZoom])

  return (
    <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10 flex flex-row items-center gap-3 pointer-events-auto select-none">

      {/* ── Tick labels (left column) ───────────────────────────────────── */}
      <div className="relative" style={{ height: TRACK_H }}>
        {TICKS.map(({ altKm: tAlt, label }) => {
          const tZoom = altKmToZoom(tAlt)
          const frac  = zoomToFrac(tZoom)
          if (frac < 0 || frac > 1) return null
          const y = frac * TRACK_H
          return (
            <div
              key={tAlt}
              className="absolute right-0 flex items-center gap-1.5"
              style={{ top: y, transform: 'translateY(-50%)' }}
            >
              <span className="text-[8px] font-mono text-zinc-600 tracking-widest whitespace-nowrap">
                {label}
              </span>
              {/* Tick dash connecting label to track */}
              <div style={{ width: 8, height: 1, backgroundColor: '#3f3f46' }} />
            </div>
          )
        })}
      </div>

      {/* ── Slider track ────────────────────────────────────────────────── */}
      <div
        ref={trackRef}
        onClick={onTrackClick}
        className="relative cursor-ns-resize"
        style={{ width: 16, height: TRACK_H }}
      >
        {/* Track groove */}
        <div
          className="absolute left-1/2 -translate-x-1/2 rounded-full"
          style={{ top: 0, bottom: 0, width: 1, backgroundColor: '#27272a' }}
        />

        {/* Filled segment (top of track → thumb = "zoomed in" zone) */}
        <div
          className="absolute left-1/2 -translate-x-1/2 rounded-full"
          style={{
            top: 0,
            height: thumbY,
            width: 1,
            backgroundColor: accent,
            opacity: 0.35,
          }}
        />

        {/* Tick notches on the groove */}
        {TICKS.map(({ altKm: tAlt }) => {
          const frac = zoomToFrac(altKmToZoom(tAlt))
          if (frac < 0 || frac > 1) return null
          return (
            <div
              key={tAlt}
              className="absolute left-1/2"
              style={{
                top: frac * TRACK_H,
                transform: 'translate(-50%, -50%)',
                width: 5,
                height: 1,
                backgroundColor: '#52525b',
              }}
            />
          )
        })}

        {/* Thumb */}
        <div
          onMouseDown={onThumbMouseDown}
          className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-sm"
          style={{
            top: thumbY,
            width: 12,
            height: 4,
            backgroundColor: accent,
            boxShadow: `0 0 10px ${accent}99`,
            cursor: 'ns-resize',
          }}
        />

        {/* Floating altitude label that follows the thumb */}
        <div
          className="absolute pointer-events-none"
          style={{
            top: thumbY,
            right: 'calc(100% + 6px)',
            transform: 'translateY(-50%)',
            whiteSpace: 'nowrap',
          }}
        >
          <span
            className="text-[8px] font-mono tracking-widest"
            style={{ color: accent, opacity: 0.9 }}
          >
            {formatAlt(altKm)}
          </span>
        </div>
      </div>
    </div>
  )
}
