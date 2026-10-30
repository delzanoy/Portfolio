/**
 * SGP4 propagation helpers wrapping satellite.js
 *
 * Coordinate conventions:
 *   ECI  X → vernal equinox (equatorial plane)
 *   ECI  Y → 90° east (equatorial plane)
 *   ECI  Z → north pole
 *
 *   Three.js Y = up → maps to ECI Z
 *   Three.js X      → maps to ECI X
 *   Three.js Z      → maps to -ECI Y  (right-hand flip)
 *
 * Scale: 1 Three.js unit = EARTH_RADIUS_KM km  (Earth surface ≈ 1.4 units)
 */

import {
  propagate,
  twoline2satrec,
  type SatRec,
} from './satellite-js-browser'

export type { SatRec }

export const EARTH_VISUAL_RADIUS = 1.4   // Three.js units — matches Earth GLB
export const EARTH_RADIUS_KM = 6371
export const ALT_EXAGGERATION = 5        // altitude stretch factor for visual clarity

// True-scale factor (kept for any callers that need raw ECI → scene units)
const SCALE = EARTH_VISUAL_RADIUS / EARTH_RADIUS_KM

export function parseTle(line1: string, line2: string): SatRec {
  return twoline2satrec(line1, line2)
}

/** Returns ECI position in km, or null when propagation fails. */
export function propagateEci(
  satrec: SatRec,
  date: Date
): { x: number; y: number; z: number } | null {
  const result = propagate(satrec, date)
  if (!result) return null
  const pos = result.position
  if (!pos || typeof pos === 'boolean') return null
  return pos as { x: number; y: number; z: number }
}

/** Convert ECI km → Three.js scene units [x, y, z] (true scale). */
export function eciToThree(eci: {
  x: number
  y: number
  z: number
}): [number, number, number] {
  return [eci.x * SCALE, eci.z * SCALE, -eci.y * SCALE]
}

/**
 * Convert ECI km → Three.js scene units with altitude exaggeration.
 * Keeps the Earth at EARTH_VISUAL_RADIUS but fans orbital altitudes
 * outward by ALT_EXAGGERATION so different orbital shells are clearly
 * distinguishable from each other and from the Earth's surface.
 */
export function eciToThreeExaggerated(eci: {
  x: number
  y: number
  z: number
}): [number, number, number] {
  const r_km = Math.sqrt(eci.x * eci.x + eci.y * eci.y + eci.z * eci.z)
  if (r_km === 0) return [0, 0, 0]
  const alt_km = r_km - EARTH_RADIUS_KM
  const visualR = EARTH_VISUAL_RADIUS + (alt_km / EARTH_RADIUS_KM) * ALT_EXAGGERATION
  const s = visualR / r_km
  return [eci.x * s, eci.z * s, -eci.y * s]
}

/** One-shot: parse TLE + propagate + convert. Returns null on failure. */
export function tleToThreePosition(
  line1: string,
  line2: string,
  date: Date
): [number, number, number] | null {
  const satrec = parseTle(line1, line2)
  const eci = propagateEci(satrec, date)
  if (!eci) return null
  return eciToThree(eci)
}
