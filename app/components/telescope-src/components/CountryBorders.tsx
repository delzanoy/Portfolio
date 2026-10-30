'use client'

/**
 * CountryBorders
 *
 * Renders country coastlines + internal borders as a single LineSegments
 * draw call on the Earth's surface. Must be placed inside the EarthModel
 * rotating group so it co-rotates automatically.
 *
 * Data: world-atlas countries-50m.json (TopoJSON)
 *   - land mesh      → coastlines (brighter)
 *   - countries mesh → internal borders (fainter)
 *
 * Coordinate convention:
 *   lon=0° lat=0° → +Z axis (toward viewer at rest)
 *   lat increases → +Y (north pole)
 */

import { useMemo } from 'react'
import * as THREE from 'three'
import { mesh } from 'topojson-client'
import type { Topology, GeometryCollection, GeometryObject } from 'topojson-specification'
import { useStore } from '../store/useStore'

// 50m resolution — good detail, ~300KB
import worldData from 'world-atlas/countries-50m.json'

// ─── Tuning ────────────────────────────────────────────────────────────────────
// Sit just above the surface (Earth visual radius ≈ 1.4).
// The parent group's scale is controlled via mapScale in the store.
const EARTH_R = 1.403

// Africa numeric IDs in Natural Earth / world-atlas 50m
// (ISO 3166-1 numeric codes for countries on the African continent)
const AFRICA_IDS = new Set([
  12,24,72,86,108,120,132,140,144,174,175,178,180,204,231,232,262,266,270,288,
  324,328,336,384,404,426,430,434,450,454,466,478,504,508,516,562,566,624,630,
  638,646,654,678,686,694,706,710,716,728,729,732,740,748,752,788,800,818,834,
  854,894,
])

// ─── Helpers ──────────────────────────────────────────────────────────────────

function latLonToVec3(lat: number, lon: number, r = EARTH_R): [number, number, number] {
  const phi   = THREE.MathUtils.degToRad(lat)
  const theta = THREE.MathUtils.degToRad(lon)
  return [
    r * Math.cos(phi) * Math.sin(theta),
    r * Math.sin(phi),
    r * Math.cos(phi) * Math.cos(theta),
  ]
}

type Ring = number[][]

function pushSegments(positions: number[], ring: Ring) {
  for (let i = 0; i < ring.length - 1; i++) {
    const [lon1, lat1] = ring[i]
    const [lon2, lat2] = ring[i + 1]
    const [x1, y1, z1] = latLonToVec3(lat1, lon1)
    const [x2, y2, z2] = latLonToVec3(lat2, lon2)
    positions.push(x1, y1, z1, x2, y2, z2)
  }
}

function buildGeometry(
  topology: Topology,
  objectName: string,
  filter?: (a: GeometryObject, b: GeometryObject) => boolean
): THREE.BufferGeometry {
  const obj = topology.objects[objectName] as GeometryCollection
  const geomMesh = filter
    ? mesh(topology, obj, filter)
    : mesh(topology, obj)

  const positions: number[] = []
  const geom = geomMesh as unknown as { type: string; coordinates: Ring[] }

  if (geom.type === 'LineString') {
    pushSegments(positions, geom.coordinates as unknown as Ring)
  } else if (geom.type === 'MultiLineString') {
    for (const ring of geom.coordinates) {
      pushSegments(positions, ring)
    }
  }

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  return geo
}

/** Africa coastline geometry — bright highlight for alignment reference */
function buildAfricaGeometry(topology: Topology): THREE.BufferGeometry {
  const obj = topology.objects['countries'] as GeometryCollection
  const africaMesh = mesh(
    topology,
    obj,
    (a: any, b: any) => {
      const aId = Number(a.id)
      const bId = Number(b.id)
      return AFRICA_IDS.has(aId) || AFRICA_IDS.has(bId)
    }
  )

  const positions: number[] = []
  const geom = africaMesh as unknown as { type: string; coordinates: Ring[] }

  if (geom.type === 'LineString') {
    pushSegments(positions, geom.coordinates as unknown as Ring)
  } else if (geom.type === 'MultiLineString') {
    for (const ring of geom.coordinates) {
      pushSegments(positions, ring)
    }
  }

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  return geo
}

/** Build highlighted country geometry for a given topoName */
function buildHighlightGeometry(topology: Topology, topoName: string): THREE.BufferGeometry {
  const obj = topology.objects['countries'] as GeometryCollection
  const features = (obj.geometries || []) as any[]

  // Find the feature whose properties.name matches
  const matchedIds = new Set<number>()
  for (const feat of features) {
    const name: string = feat.properties?.name ?? ''
    if (name.toLowerCase().includes(topoName.toLowerCase())) {
      matchedIds.add(Number(feat.id))
    }
  }

  if (matchedIds.size === 0) {
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.Float32BufferAttribute([], 3))
    return geo
  }

  const highlighted = mesh(
    topology,
    obj,
    (a: any, b: any) => {
      const aId = Number(a.id)
      const bId = Number(b.id)
      return matchedIds.has(aId) || matchedIds.has(bId)
    }
  )

  const positions: number[] = []
  const geom = highlighted as unknown as { type: string; coordinates: Ring[] }

  if (geom.type === 'LineString') {
    pushSegments(positions, geom.coordinates as unknown as Ring)
  } else if (geom.type === 'MultiLineString') {
    for (const ring of geom.coordinates) {
      pushSegments(positions, ring)
    }
  }

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  return geo
}

/** Equator ring at lat = 0 */
function buildEquatorGeometry(segments = 360): THREE.BufferGeometry {
  const positions: number[] = []
  for (let i = 0; i < segments; i++) {
    const lon1 = (i / segments) * 360 - 180
    const lon2 = ((i + 1) / segments) * 360 - 180
    const [x1, y1, z1] = latLonToVec3(0, lon1)
    const [x2, y2, z2] = latLonToVec3(0, lon2)
    positions.push(x1, y1, z1, x2, y2, z2)
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  return geo
}

/** Prime meridian line at lon = 0, pole to pole */
function buildMeridianGeometry(segments = 180): THREE.BufferGeometry {
  const positions: number[] = []
  for (let i = 0; i < segments; i++) {
    const lat1 = (i / segments) * 180 - 90
    const lat2 = ((i + 1) / segments) * 180 - 90
    const [x1, y1, z1] = latLonToVec3(lat1, 0)
    const [x2, y2, z2] = latLonToVec3(lat2, 0)
    positions.push(x1, y1, z1, x2, y2, z2)
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  return geo
}

// ─── Bounding Box Utility (exported) ──────────────────────────────────────────

/**
 * Returns the approximate bounding box for a country by its TopoJSON feature name.
 * Iterates over all arcs in the feature and finds min/max lat/lon.
 */
export function getCountryBounds(
  topoName: string
): { minLat: number; maxLat: number; minLon: number; maxLon: number } | null {
  const topology = worldData as unknown as Topology
  const obj = topology.objects['countries'] as GeometryCollection
  const features = (obj.geometries || []) as any[]

  const matched = features.find(
    (f: any) => (f.properties?.name ?? '').toLowerCase().includes(topoName.toLowerCase())
  )
  if (!matched) return null

  // Use the mesh to get the actual arc coordinates
  const highlighted = mesh(topology, obj, (a: any) => Number(a.id) === Number(matched.id))
  const geom = highlighted as unknown as { type: string; coordinates: Ring[] }

  let minLat = Infinity, maxLat = -Infinity
  let minLon = Infinity, maxLon = -Infinity

  const processRing = (ring: Ring) => {
    for (const [lon, lat] of ring) {
      if (lat < minLat) minLat = lat
      if (lat > maxLat) maxLat = lat
      if (lon < minLon) minLon = lon
      if (lon > maxLon) maxLon = lon
    }
  }

  if (geom.type === 'LineString') {
    processRing(geom.coordinates as unknown as Ring)
  } else if (geom.type === 'MultiLineString') {
    for (const ring of geom.coordinates) processRing(ring)
  }

  if (minLat === Infinity) return null
  return { minLat, maxLat, minLon, maxLon }
}

// ─── Component ────────────────────────────────────────────────────────────────

interface CountryBordersProps {
  coastColor?:  string
  borderColor?: string
  coastOpacity?:  number
  borderOpacity?: number
  highlightedCountryName?: string | null
}

export function CountryBorders({
  coastColor   = '#ffffff',
  borderColor  = '#ffffff',
  coastOpacity  = 0.18,
  borderOpacity = 0.08,
  highlightedCountryName,
}: CountryBordersProps) {
  const topology = worldData as unknown as Topology
  const mapDebugGuides = useStore(s => s.mapDebugGuides)

  const coastGeo = useMemo(
    () => buildGeometry(topology, 'land'),
    []
  )

  const borderGeo = useMemo(
    () =>
      buildGeometry(
        topology,
        'countries',
        (a: GeometryObject, b: GeometryObject) => a !== b
      ),
    []
  )

  const africaGeo   = useMemo(() => buildAfricaGeometry(topology),  [])
  const equatorGeo  = useMemo(() => buildEquatorGeometry(),          [])
  const meridianGeo = useMemo(() => buildMeridianGeometry(),         [])

  const highlightGeo = useMemo(
    () => highlightedCountryName
      ? buildHighlightGeometry(topology, highlightedCountryName)
      : null,
    [highlightedCountryName]
  )

  return (
    <>
      {/* Coastlines */}
      <lineSegments geometry={coastGeo}>
        <lineBasicMaterial
          color={coastColor}
          transparent
          opacity={coastOpacity}
          depthWrite={false}
        />
      </lineSegments>

      {/* Internal country borders */}
      <lineSegments geometry={borderGeo}>
        <lineBasicMaterial
          color={borderColor}
          transparent
          opacity={borderOpacity}
          depthWrite={false}
        />
      </lineSegments>

      {/* Highlighted country border */}
      {highlightGeo && (
        <lineSegments geometry={highlightGeo}>
          <lineBasicMaterial
            color="#00E5FF"
            transparent
            opacity={0.9}
            depthWrite={false}
            linewidth={2.5}
          />
        </lineSegments>
      )}

      {/* ── Debug guides ─────────────────────────────────────── */}
      {mapDebugGuides && (
        <>
          {/* Africa highlighted in orange — straddles 0° lon / 0° lat */}
          <lineSegments geometry={africaGeo}>
            <lineBasicMaterial color="#FF6B00" transparent opacity={0.9} depthWrite={false} />
          </lineSegments>

          {/* Equator — bright yellow horizontal ring */}
          <lineSegments geometry={equatorGeo}>
            <lineBasicMaterial color="#FFE500" transparent opacity={1} depthWrite={false} />
          </lineSegments>

          {/* Prime meridian — bright green vertical line */}
          <lineSegments geometry={meridianGeo}>
            <lineBasicMaterial color="#00FF88" transparent opacity={1} depthWrite={false} />
          </lineSegments>
        </>
      )}
    </>
  )
}
