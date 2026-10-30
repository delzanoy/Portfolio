'use client'

import { useRef, useMemo } from 'react'
import { useFrame, useThree, ThreeEvent } from '@react-three/fiber'
import { Line } from '@react-three/drei'
import * as THREE from 'three'
import { parseTle, propagateEci, eciToThreeExaggerated } from '../lib/sgp4'
import { useStore } from '../store/useStore'
import { tleToAsset } from '../utils/tleToAsset'
import { getCountryCodes } from '../data/countryCodes'
import { SatelliteObject, satelliteScreenPositions, SIM_START_TIME } from './Satellite'
import type { SatRec } from '../lib/sgp4'

const ORBIT_SEGMENTS = 180

// ─── Orbit line for selected satellite ───────────────────────────────────────
function SelectedOrbitLine({ satrec }: { satrec: SatRec }) {
  const points = useMemo<[number, number, number][]>(() => {
    const now = SIM_START_TIME
    const meanMotion = satrec.no  // rad/min
    const periodMs = (2 * Math.PI / meanMotion) * 60 * 1000
    const pts: [number, number, number][] = []

    for (let i = 0; i <= ORBIT_SEGMENTS; i++) {
      const t = new Date(now + (i / ORBIT_SEGMENTS) * periodMs)
      const eci = propagateEci(satrec, t)
      if (eci) pts.push(eciToThreeExaggerated(eci))
    }
    return pts
  }, [satrec])

  if (points.length < 2) return null

  return (
    <Line
      points={points}
      color="#a855f7"
      lineWidth={1.2}
      dashed
      dashSize={0.06}
      gapSize={0.04}
      transparent
      opacity={0.5}
    />
  )
}

// ─── Single satellite instance ────────────────────────────────────────────────
function LiveSatInstance({ satrec, isSelected }: { satrec: SatRec; isSelected: boolean }) {
  const groupRef = useRef<THREE.Group>(null)
  const satRef   = useRef<THREE.Group>(null)

  const { setSelectedLiveSatNoradId, setSelectedAsset, setHoveredLiveSatNoradId, tleRecords } = useStore()

  useFrame(() => {
    const simulatedDate = new Date(Date.now() + useStore.getState().simulatedTimeOffset)
    const eci = propagateEci(satrec, simulatedDate)
    if (!eci || !groupRef.current) return
    const [x, y, z] = eciToThreeExaggerated(eci)
    groupRef.current.position.set(x, y, z)

    if (satRef.current) {
      const s = isSelected ? 0.013 : 0.009
      satRef.current.scale.lerp(new THREE.Vector3(s, s, s), 0.1)
    }
  })

  const noradId = typeof satrec.satnum === 'string' ? parseInt(satrec.satnum, 10) : satrec.satnum as number


  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    const record = tleRecords.find(r => r.noradId === noradId)
    if (record) {
      setSelectedLiveSatNoradId(noradId)
      setSelectedAsset(tleToAsset(record))
    }
  }

  const handlePointerOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    setHoveredLiveSatNoradId(noradId)
    document.body.style.cursor = 'pointer'
  }

  const handlePointerOut = () => {
    setHoveredLiveSatNoradId(null)
    document.body.style.cursor = 'auto'
  }


  return (
    <group 
      ref={groupRef}
      onClick={handleClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      <SatelliteObject ref={satRef} color={isSelected ? '#a855f7' : '#3b82f6'} />
    </group>
  )
}

// ─── Background dot ───────────────────────────────────────────────────────────
// Lightweight sphere used for unselected background satellites.
// Avoids the cost of GLB clones + Html labels for hundreds of objects.
function BackgroundSatDot({ satrec, isHighlighted }: { satrec: SatRec; isHighlighted?: boolean }) {
  const { setSelectedLiveSatNoradId, setSelectedAsset, setHoveredLiveSatNoradId, hoveredLiveSatNoradId, tleRecords } = useStore()
  const noradId = typeof satrec.satnum === 'string' ? parseInt(satrec.satnum, 10) : satrec.satnum as number

  const isHovered = hoveredLiveSatNoradId === noradId
  
  const meshRef = useRef<THREE.Mesh>(null)
  const color = isHighlighted ? '#f59e0b' : (isHovered ? '#60a5fa' : '#3b82f6')
  const size = (isHighlighted || isHovered) ? 0.012 : 0.008

  useFrame(() => {
    const simulatedDate = new Date(Date.now() + useStore.getState().simulatedTimeOffset)
    const eci = propagateEci(satrec, simulatedDate)
    if (!eci || !meshRef.current) return
    const [x, y, z] = eciToThreeExaggerated(eci)
    meshRef.current.position.set(x, y, z)
  })

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    const record = tleRecords.find(r => r.noradId === noradId)
    if (record) {
      setSelectedLiveSatNoradId(noradId)
      setSelectedAsset(tleToAsset(record))
    }
  }

  const handlePointerOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    setHoveredLiveSatNoradId(noradId)
    document.body.style.cursor = 'pointer'
  }

  const handlePointerOut = () => {
    setHoveredLiveSatNoradId(null)
    document.body.style.cursor = 'auto'
  }


  return (
    <mesh 
      ref={meshRef}
      onClick={handleClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      <sphereGeometry args={[size, 6, 6]} />
      <meshStandardMaterial 
        color={color} 
        emissive={color} 
        emissiveIntensity={isHighlighted ? 2.0 : 0.6} 
        transparent 
        opacity={isHighlighted ? 0.95 : 0.75} 
      />
    </mesh>
  )
}

// ─── Camera follow + screen-position writer for the selected satellite ────────
// Runs every frame: smoothly moves camera behind the satellite and writes its
// projected screen coords to satelliteScreenPositions so AssetDetails can follow.
function SelectedSatTracker({ satrec, noradId }: { satrec: SatRec; noradId: number }) {
  const { camera, gl } = useThree()
  const camPosTarget = useRef<THREE.Vector3 | null>(null)
  // Once the camera lerp has converged we stop overriding it so OrbitControls
  // can take over and the user can drag/rotate freely.
  const arrived = useRef(false)
  const assetId = `TLE-${noradId}`

  useFrame((_, delta) => {
    const simulatedDate = new Date(Date.now() + useStore.getState().simulatedTimeOffset)
    const eci = propagateEci(satrec, simulatedDate)
    if (!eci) return

    const [x, y, z] = eciToThreeExaggerated(eci)
    const satPos = new THREE.Vector3(x, y, z)

    // Always write screen-space position so AssetDetails keeps following
    const ndc = satPos.clone().project(camera)
    const canvas = gl.domElement
    satelliteScreenPositions.set(assetId, {
      x: (ndc.x * 0.5 + 0.5) * canvas.clientWidth,
      y: (-ndc.y * 0.5 + 0.5) * canvas.clientHeight,
    })

    // Camera fly-in: run only until we're close enough, then hand off to OrbitControls
    if (!arrived.current) {
      if (!camPosTarget.current) camPosTarget.current = camera.position.clone()

      const zoomFactor = 1 / Math.max(0.5, Math.min(2.5, useStore.getState().cameraZoom))
      const offset = satPos.clone().normalize().multiplyScalar(2.5 * zoomFactor)
      const desiredPos = satPos.clone().add(offset)

      const t = 1 - Math.pow(0.001, delta)
      camPosTarget.current.lerp(desiredPos, t)
      camera.position.copy(camPosTarget.current)
      camera.lookAt(satPos)

      if (camPosTarget.current.distanceTo(desiredPos) < 0.05) {
        arrived.current = true
      }
    }
  })

  return null
}

// ─── Main layer ───────────────────────────────────────────────────────────────
// Background: up to MAX_BG cheap sphere dots (no GLB, no labels).
// Selected satellite: full GLB model + label + real orbit line.
export function LiveSatelliteLayer() {
  const { tleRecords, selectedLiveSatNoradId, searchQuery } = useStore()

  const selectedIdx = useMemo(
    () => tleRecords.findIndex((r) => r.noradId === selectedLiveSatNoradId),
    [tleRecords, selectedLiveSatNoradId]
  )

  // Identify highlighted records based on search
  const highlightedIds = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return new Set<number>()
    
    const relatedCodes = getCountryCodes(q).map(c => c.toLowerCase())
    
    const matches = tleRecords.filter(r => {
      const asset = tleToAsset(r)
      const nameMatch = r.name.toLowerCase().includes(q)
      const idMatch = String(r.noradId).includes(q)
      const ownerMatch = asset.owner?.toLowerCase().includes(q)
      const missionMatch = asset.missionType?.toLowerCase().includes(q)
      const codeMatch = r.countryCode ? r.countryCode.toLowerCase().includes(q) : false
      const countryNameMatch = r.countryCode ? relatedCodes.includes(r.countryCode.toLowerCase()) : false
      
      return nameMatch || idMatch || ownerMatch || missionMatch || codeMatch || countryNameMatch
    })
    
    return new Set(matches.map(m => m.noradId))
  }, [tleRecords, searchQuery])

  // Parse only what we need: selected + background slice + highlighted matches
  const bgRecords = useMemo(() => {
    const unselected = tleRecords.filter((r) => r.noradId !== selectedLiveSatNoradId)
    
    // Always include highlighted ones if they are in the unselected list
    const highlighted = unselected.filter(r => highlightedIds.has(r.noradId))
    const others = unselected.filter(r => !highlightedIds.has(r.noradId))
    
    // Combine them, prioritized highlighted ones, but cap at a reasonable limit for performance
    return [...highlighted, ...others].slice(0, 100) // increased cap to 100
  }, [tleRecords, selectedLiveSatNoradId, highlightedIds])

  const bgSatrecs = useMemo(
    () => bgRecords.map((r) => parseTle(r.line1!, r.line2!)),
    [bgRecords]
  )

  const selectedSatrec = useMemo(
    () => selectedIdx >= 0
      ? parseTle(tleRecords[selectedIdx].line1!, tleRecords[selectedIdx].line2!)
      : null,
    [tleRecords, selectedIdx]
  )

  if (tleRecords.length === 0) return null

  return (
    <>
      {bgRecords.map((rec, i) => (
        <BackgroundSatDot 
          key={`${rec.noradId}-${i}`} 
          satrec={bgSatrecs[i]} 
          isHighlighted={highlightedIds.has(rec.noradId)}
        />
      ))}
      {selectedIdx >= 0 && selectedSatrec && (
        <>
          <SelectedSatTracker
            key={`${tleRecords[selectedIdx].noradId}-tracker`}
            satrec={selectedSatrec}
            noradId={tleRecords[selectedIdx].noradId}
          />
          <LiveSatInstance
            key={`${tleRecords[selectedIdx].noradId}-instance`}
            satrec={selectedSatrec}
            isSelected
          />
          <SelectedOrbitLine satrec={selectedSatrec} />
        </>
      )}
    </>
  )
}
