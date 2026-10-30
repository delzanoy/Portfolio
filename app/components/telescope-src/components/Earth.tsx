'use client'

import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, useGLTF, useTexture } from '@react-three/drei'
import { Suspense, useMemo, useRef, useEffect } from 'react'
import * as THREE from 'three'
import { LiveSatelliteLayer } from './LiveSatelliteLayer'
import { CountryBorders } from './CountryBorders'
import { useStore } from '../store/useStore'
import { findCountry } from '../data/countryCodes'

/* ===========================
   Astronomical Utilities
=========================== */

const D2R = Math.PI / 180

// Convert current date → Julian Day Number
function getJulianDate(date: Date) {
    return date.getTime() / 86400000 + 2440587.5
}

// Greenwich Mean Sidereal Time in radians
// Reference: USNO Circular 179, simplified formula
function getGMST(date: Date): number {
    const jd = getJulianDate(date)
    const T = (jd - 2451545.0) / 36525
    let gmst =
        280.46061837 +
        360.98564736629 * (jd - 2451545.0) +
        0.000387933 * T * T -
        (T * T * T) / 38710000
    gmst = ((gmst % 360) + 360) % 360 // normalize 0–360
    return gmst * D2R
}

// Sun's apparent ecliptic longitude → equatorial RA (radians) and declination (radians)
function getSunPosition(date: Date): { ra: number; dec: number } {
    const jd = getJulianDate(date)
    const n = jd - 2451545.0

    const L = (280.46 + 0.9856474 * n) % 360           // mean longitude
    const g = ((357.528 + 0.9856003 * n) % 360 + 360) % 360 // mean anomaly

    const lambda =
        L +
        1.915 * Math.sin(g * D2R) +
        0.02 * Math.sin(2 * g * D2R)                  // ecliptic longitude

    const epsilon = 23.44                               // obliquity of ecliptic (deg)

    const ra = Math.atan2(
        Math.cos(epsilon * D2R) * Math.sin(lambda * D2R),
        Math.cos(lambda * D2R)
    )
    const dec = Math.asin(
        Math.sin(epsilon * D2R) * Math.sin(lambda * D2R)
    )
    return { ra, dec }
}

/* ===========================
   Earth Model
=========================== */

// Real sidereal rotation rate (rad/s)
const SIDEREAL_RATE = (2 * Math.PI) / 86164

function EarthModel() {
    const { scene } = useGLTF('/earth.glb')
    const texture = useTexture('/earth_texture.jpeg')
    const rotRef = useRef<THREE.Group | null>(null)
    const mapLonOffset = useStore(s => s.mapLonOffset)
    const mapScale = useStore(s => s.mapScale)
    const highlightedCountryCode = useStore(s => s.highlightedCountryCode)

    // Resolve country name from code for highlighting
    const highlightedCountryName = useMemo(() => {
        if (!highlightedCountryCode) return null
        const entry = findCountry(highlightedCountryCode)
        return entry?.topoName ?? highlightedCountryCode
    }, [highlightedCountryCode])

    // Capture GMST once on the first frame so Earth starts at the real orientation
    const gmstStart = useRef<number | null>(null)
    const clockStart = useRef<number | null>(null)
    const mapLonOffsetRef = useRef(mapLonOffset)
    mapLonOffsetRef.current = mapLonOffset

    // Clone the scene and clone materials for this instance
    const clonedScene = useMemo(() => {
        texture.flipY = false
        const clone = scene.clone()
        clone.traverse((child: any) => {
            if (child.isMesh) {
                child.material = child.material.clone()
                child.material.map = texture
                child.material.needsUpdate = true
            }
        })
        return clone
    }, [scene, texture])

    useFrame(({ clock }) => {
        if (!rotRef.current) return
        if (gmstStart.current === null) {
            gmstStart.current = getGMST(new Date())
            clockStart.current = clock.elapsedTime
        }

        // Instead of calculating elapsed time purely from clock, we need to respect the simulatedTimeOffset dynamically.
        // The easiest way is to recalculate GMST every frame based on Date.now() + simulatedTimeOffset.
        const simulatedDate = new Date(Date.now() + useStore.getState().simulatedTimeOffset)
        rotRef.current.rotation.y = getGMST(simulatedDate) + Math.PI / 2 - mapLonOffsetRef.current * D2R
    })

    return (
        <group rotation={[THREE.MathUtils.degToRad(-1.5), 0, 0]}>
            {/* Everything inside rotRef co-rotates with Earth */}
            <group ref={rotRef}>
                <primitive object={clonedScene} scale={0.0125} />
                <group
                    rotation={[0, THREE.MathUtils.degToRad(mapLonOffset), 0]}
                    scale={[mapScale, mapScale, mapScale]}
                >
                    <CountryBorders highlightedCountryName={highlightedCountryName} />
                </group>
            </group>
        </group>
    )
}

/* ===========================
   Sun Light (Astronomical)
=========================== */

function SunLight() {
    const lightRef = useRef<THREE.DirectionalLight>(null)

    useFrame(() => {
        if (!lightRef.current) return
        const simulatedDate = new Date(Date.now() + useStore.getState().simulatedTimeOffset)
        const { ra, dec } = getSunPosition(simulatedDate)
        const R = 50
        lightRef.current.position.set(
            R * Math.cos(dec) * Math.cos(ra),
            R * Math.sin(dec),
            -R * Math.cos(dec) * Math.sin(ra),
        )
        lightRef.current.lookAt(0, 0, 0)
    })

    return <directionalLight ref={lightRef} intensity={4} castShadow={false} />
}

function NightLight() {
    const lightRef = useRef<THREE.DirectionalLight>(null)

    useFrame(() => {
        if (!lightRef.current) return
        const simulatedDate = new Date(Date.now() + useStore.getState().simulatedTimeOffset)
        const { ra, dec } = getSunPosition(simulatedDate)
        const R = 50
        lightRef.current.position.set(
            -R * Math.cos(dec) * Math.cos(ra),
            -R * Math.sin(dec),
            R * Math.cos(dec) * Math.sin(ra),
        )
        lightRef.current.lookAt(0, 0, 0)
    })

    return <directionalLight ref={lightRef} intensity={1.5} />
}

/* ===========================
   Scene
=========================== */

function GlobalZoomController() {
    const { camera } = useThree()
    const cameraZoom = useStore(s => s.cameraZoom)
    const selectedLiveSatNoradId = useStore(s => s.selectedLiveSatNoradId)

    useFrame(() => {
        if (!selectedLiveSatNoradId) {
            const targetDistance = 5 / cameraZoom
            const currentDistance = camera.position.length()
            if (Math.abs(currentDistance - targetDistance) > 0.001) {
                camera.position.setLength(currentDistance + (targetDistance - currentDistance) * 0.1)
            }
        }
    })

    return null
}

function GeolocationController() {
    const { camera } = useThree()
    const cameraZoom = useStore(s => s.cameraZoom)
    const hasPositioned = useRef(false)

    useEffect(() => {
        if (!hasPositioned.current) {
            hasPositioned.current = true // Prevent multiple fetches
            fetch('https://get.geojs.io/v1/ip/geo.json')
                .then(res => res.json())
                .then(data => {
                    const latitude = parseFloat(data.latitude)
                    const longitude = parseFloat(data.longitude)

                    if (isNaN(latitude) || isNaN(longitude)) return

                    const latR = latitude * D2R
                    const lonR = longitude * D2R
                    const gmst = getGMST(new Date())
                    const ra = gmst + lonR
                    const dec = latR

                    const targetDistance = 5 / cameraZoom

                    camera.position.set(
                        targetDistance * Math.cos(dec) * Math.cos(ra),
                        targetDistance * Math.sin(dec),
                        -targetDistance * Math.cos(dec) * Math.sin(ra)
                    )
                    camera.lookAt(0, 0, 0)
                })
                .catch(err => console.warn("IP Geolocation failed", err))
        }
    }, [camera, cameraZoom])

    return null
}

import { m } from 'framer-motion'

interface EarthProps {
    onDeselect?: () => void
    isPreview?: boolean
}

export default function Earth({ onDeselect, isPreview = false }: EarthProps) {
    return (
        <m.div className="absolute inset-0 z-0 overflow-hidden">
            <Canvas
                camera={{ position: [0, 0, isPreview ? 2.5 : 5], fov: 45 }}
                gl={{ antialias: true, alpha: true }}
                onPointerMissed={onDeselect}
            >
                <Suspense fallback={null}>
                    <SunLight />
                    <NightLight />
                    <group
                        position={isPreview ? [0, -1.8, 0] : [0, 0, 0]}
                        scale={isPreview ? 1.35 : 1}
                    >
                        <EarthModel />
                        <LiveSatelliteLayer />
                    </group>
                    {!isPreview && <GlobalZoomController />}
                    {!isPreview && <GeolocationController />}

                    <OrbitControls
                        enableZoom={false}
                        enablePan={false}
                        enableRotate={!isPreview}
                        autoRotate={isPreview}
                        autoRotateSpeed={0.8}
                    />
                </Suspense>
            </Canvas>
        </m.div>
    )
}
