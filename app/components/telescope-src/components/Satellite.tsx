'use client'

import { useFrame, useThree, ThreeElements } from '@react-three/fiber'
import { useGLTF, Line, Html } from '@react-three/drei'
import { useRef, useState, useMemo, forwardRef, useEffect } from 'react'
import * as THREE from 'three'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import { Asset } from '../types'
import { useStore } from '../store/useStore'

// ─── Constants ────────────────────────────────────────────────────────────────
const PROXIMITY_RADIUS = 35    // px — screen-space halo activation radius
export const SIM_START_TIME = Date.now()

// Module-level mutable state (Three.js ↔ DOM bridge)
export const satelliteScreenPositions = new Map<string, { x: number; y: number }>()
export const satelliteVisible = new Map<string, boolean>()
const mouseScreenPos = { x: -9999, y: -9999 }


/* ══════════════════════════════════════════════════════════════
   SatelliteObject
   Pure 3D GLB mesh with self-rotation.
   No orbit logic, no interaction.
══════════════════════════════════════════════════════════════ */
type SatelliteObjectProps = ThreeElements['group'] & { color?: string }

export const SatelliteObject = forwardRef<THREE.Group, SatelliteObjectProps>(
  ({ color = '#00ffcc', ...props }, ref) => {
    const { scene } = useGLTF('/satellite.glb')
    const cloned = useMemo(() => scene.clone(true), [scene])
    const innerRef = useRef<THREE.Group>(null)

    useMemo(() => {
      cloned.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh
          mesh.material = new THREE.MeshStandardMaterial({
            color: new THREE.Color(color),
            emissive: new THREE.Color(color).multiplyScalar(0.3),
            emissiveIntensity: 2,
            metalness: 0.8,
            roughness: 0.2,
            transparent: true,
            opacity: 0.9,
          })
        }
      })
    }, [cloned, color])

    useFrame((_, delta) => {
      if (innerRef.current) {
        innerRef.current.rotation.y += 0.05 * delta
        innerRef.current.rotation.z += 0.02 * delta
      }
    })

    return (
      <group ref={ref} {...props} scale={0.009}>
        <primitive ref={innerRef} object={cloned} rotation={[0, Math.PI / 2, 0]} />
      </group>
    )
  }
)
SatelliteObject.displayName = 'SatelliteObject'


/* ══════════════════════════════════════════════════════════════
   DebrisObject
   Procedural mesh for debris objects — a faceted metallic shard
   that looks clearly different from the satellite GLB model.
══════════════════════════════════════════════════════════════ */
type DebrisObjectProps = ThreeElements['group'] & { color?: string }

export const DebrisObject = forwardRef<THREE.Group, DebrisObjectProps>(
  ({ color = '#71717a', ...props }, ref) => {
    const innerRef = useRef<THREE.Mesh>(null)

    useFrame((_, delta) => {
      if (innerRef.current) {
        innerRef.current.rotation.x += 0.06 * delta
        innerRef.current.rotation.z += 0.04 * delta
      }
    })

    return (
      <group ref={ref} {...props}>
        <mesh ref={innerRef}>
          <icosahedronGeometry args={[0.011, 0]} />
          <meshStandardMaterial
            color={new THREE.Color(color)}
            emissive={new THREE.Color(color).multiplyScalar(0.15)}
            emissiveIntensity={1}
            metalness={0.85}
            roughness={0.55}
            transparent
            opacity={0.85}
          />
        </mesh>
      </group>
    )
  }
)
DebrisObject.displayName = 'DebrisObject'


/* ══════════════════════════════════════════════════════════════
   StickyPointer
   Shows a ring locked to the nearest visible satellite when the
   cursor enters PROXIMITY_RADIUS. Native cursor is never hidden.
   Place outside the Canvas in page.tsx.
══════════════════════════════════════════════════════════════ */
interface StickyPointerProps {
  assets: Asset[]
  onSelect?: (assetId: string) => void
}

export function StickyPointer({ assets, onSelect }: StickyPointerProps) {
  const snapX = useMotionValue(0)
  const snapY = useMotionValue(0)
  const x = useSpring(snapX, { stiffness: 600, damping: 35 })
  const y = useSpring(snapY, { stiffness: 600, damping: 35 })
  const [sticky, setSticky] = useState(false)
  const onSelectRef = useRef(onSelect)
  useEffect(() => { onSelectRef.current = onSelect }, [onSelect])
  const nearestIdRef = useRef<string | null>(null)

  useEffect(() => {
    let raf: number
    const mouse = { x: 0, y: 0 }

    const onMove = (e: MouseEvent) => {
      mouse.x = e.clientX
      mouse.y = e.clientY
    }

    const tick = () => {
      let minDist = Infinity
      let nearest: { x: number; y: number } | null = null
      let nearestId: string | null = null

      assets.forEach(({ id }) => {
        const pos = satelliteScreenPositions.get(id)
        if (!pos || !satelliteVisible.get(id)) return
        const dist = Math.hypot(mouse.x - pos.x, mouse.y - pos.y)
        if (dist < minDist) { minDist = dist; nearest = pos; nearestId = id }
      })

      if (nearest && minDist < PROXIMITY_RADIUS) {
        snapX.set((nearest as { x: number; y: number }).x)
        snapY.set((nearest as { x: number; y: number }).y)
        setSticky(true)
        nearestIdRef.current = nearestId
      } else {
        snapX.set(mouse.x)
        snapY.set(mouse.y)
        setSticky(false)
        nearestIdRef.current = null
      }

      raf = requestAnimationFrame(tick)
    }

    window.addEventListener('mousemove', onMove)
    raf = requestAnimationFrame(tick)
    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(raf)
    }
  }, [snapX, snapY])

  if (!sticky) return null

  return (
    <motion.div
      className="fixed top-0 left-0 pointer-events-none z-[9999]"
      style={{ x, y, translateX: '-50%', translateY: '-50%' }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ duration: 0.12 }}
    >
      <div
        className="rounded-full border-2 pointer-events-auto cursor-pointer"
        style={{
          width: 22,
          height: 22,
          borderColor: '#00E5FF',
          backgroundColor: '#00E5FF14',
          boxShadow: '0 0 8px #00E5FF55',
        }}
        onClick={() => {
          if (nearestIdRef.current) onSelectRef.current?.(nearestIdRef.current)
        }}
      />
    </motion.div>
  )
}


/* ══════════════════════════════════════════════════════════════
   SatelliteLabels
   Renders asset IDs as fixed DOM overlays above each satellite.
   Direct DOM mutation in rAF (no React state) keeps it at 60fps.
   Hides labels for satellites occluded by Earth.
   Place outside the Canvas in page.tsx.
══════════════════════════════════════════════════════════════ */
export function SatelliteLabels({ assets }: { assets: Asset[] }) {
  const labelRefs = useRef<Map<string, HTMLSpanElement>>(new Map())

  useEffect(() => {
    let raf: number
    const tick = () => {
      satelliteScreenPositions.forEach((pos, id) => {
        const el = labelRefs.current.get(id)
        if (!el) return
        if (satelliteVisible.get(id)) {
          el.style.transform = `translate(${pos.x + 12}px, ${pos.y - 8}px)`
          el.style.opacity = '1'
        } else {
          el.style.opacity = '0'
        }
      })
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none z-10">
      {assets.map(asset => (
        <span
          key={asset.id}
          ref={el => { if (el) labelRefs.current.set(asset.id, el) }}
          className="absolute top-0 left-0 text-[9px] font-mono text-zinc-500/60 tracking-widest"
          style={{ transform: 'translate(-9999px, -9999px)', whiteSpace: 'nowrap', transition: 'opacity 0.2s' }}
        >
          {asset.id}
        </span>
      ))}
    </div>
  )
}

// ─── Ghost orbit exports (stubs — no longer used) ─────────────────────────────
export const ghostWorldPosition = new THREE.Vector3()

export function GhostOrbitLayer() { return null }

export default function Satellite() { return null }
