'use client'

import { useEffect } from 'react'
import { useStore } from '../store/useStore'
import { parseTleText } from '../utils/tleParser'

const REFRESH_INTERVAL_MS = 5 * 60 * 1000  // refresh TLEs every 5 minutes

export function useLiveTle() {
  const { tleCategory, refreshKey, setTleRecords, setTleLoading, setTleError } = useStore()

  useEffect(() => {
    let cancelled = false

    async function fetchTles() {
      setTleLoading(true)
      setTleError(null)
      try {
        const categoryMap: Record<string, string> = {
          visual: 'visual',
          active: 'active',
          stations: 'stations',
          debris: 'debris',
          starlink: 'starlink'
        }
        const group = categoryMap[tleCategory] || 'visual'
        // Fetch from local static data to avoid CORS and proxy issues
        const url = `/telescope-app/data/${group}.txt`
        
        const res = await fetch(url)
        if (!res.ok) throw new Error(`TLE fetch failed: ${res.status}`)
        
        const text = await res.text()
        const records = parseTleText(text)
        
        if (!cancelled) setTleRecords(records)
      } catch (err) {
        if (!cancelled) setTleError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        if (!cancelled) setTleLoading(false)
      }
    }

    fetchTles()
    const interval = setInterval(fetchTles, REFRESH_INTERVAL_MS)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [tleCategory, refreshKey])  // re-fetch when category or refreshKey changes
}
