import {
  degreesLat,
  degreesLong,
  eciToGeodetic,
  gstime,
  type EciVec3,
} from '../lib/satellite-js-browser'
import { parseTle, propagateEci } from '../lib/sgp4'
import type { TleRecord } from '../types'

export function eciToLatLon(
  eci: { x: number; y: number; z: number },
  date: Date
): { lat: number; lon: number; alt: number } | null {
  try {
    const gmstValue = gstime(date)
    const geodetic = eciToGeodetic(
      { x: eci.x, y: eci.y, z: eci.z } as EciVec3<number>,
      gmstValue
    )
    return {
      lat: degreesLat(geodetic.latitude),
      lon: degreesLong(geodetic.longitude),
      alt: geodetic.height,
    }
  } catch {
    return null
  }
}

export function isOverBbox(
  lat: number,
  lon: number,
  bbox: { minLat: number; maxLat: number; minLon: number; maxLon: number }
): boolean {
  return (
    lat >= bbox.minLat &&
    lat <= bbox.maxLat &&
    lon >= bbox.minLon &&
    lon <= bbox.maxLon
  )
}

export function getSatLatLon(record: TleRecord, date = new Date()): { lat: number; lon: number } | null {
  try {
    const satrec = parseTle(record.line1!, record.line2!)
    const eci = propagateEci(satrec, date)
    if (!eci) return null
    return eciToLatLon(eci, date)
  } catch {
    return null
  }
}
