import { create } from 'zustand'
import { Asset, TleRecord, TleCategory } from '../types'

interface AppState {
    selectedAsset: Asset | null
    cameraZoom: number
    setCameraZoom: (zoom: number) => void
    // ── Map alignment ─────────────────────────────────────────
    mapLonOffset: number       // degrees, rotates border overlay around Y axis
    mapScale: number           // uniform scale of the border overlay sphere
    mapDebugGuides: boolean    // show equator / prime-meridian reference lines
    setMapLonOffset: (deg: number) => void
    setMapScale: (scale: number) => void
    setMapDebugGuides: (show: boolean) => void
    // ── Live satellite tracking ────────────────────────────────
    tleRecords: TleRecord[]
    tleCategory: TleCategory
    tleLoading: boolean
    tleError: string | null
    refreshKey: number
    simulatedTimeOffset: number
    selectedLiveSatNoradId: number | null
    hoveredLiveSatNoradId: number | null
    setTleRecords: (records: TleRecord[]) => void
    setTleCategory: (category: TleCategory) => void
    setTleLoading: (loading: boolean) => void
    setTleError: (error: string | null) => void
    triggerRefresh: () => void
    setSimulatedTimeOffset: (offset: number) => void
    setSelectedLiveSatNoradId: (id: number | null) => void
    setHoveredLiveSatNoradId: (id: number | null) => void
    setSelectedAsset: (asset: Asset | null) => void
    // ── Search & highlight ─────────────────────────────────────
    searchQuery: string
    setSearchQuery: (q: string) => void
    highlightedCountryCode: string | null
    setHighlightedCountryCode: (code: string | null) => void
    isSidebarOpen: boolean
    setSidebarOpen: (open: boolean) => void
}

export const useStore = create<AppState>((set) => ({
    selectedAsset: null,
    cameraZoom: 1.0,
    setCameraZoom: (cameraZoom) => set({ cameraZoom }),
    mapLonOffset: 89.9,
    mapScale: 0.8911,
    mapDebugGuides: false,
    setMapLonOffset: (mapLonOffset) => set({ mapLonOffset }),
    setMapScale: (mapScale) => set({ mapScale }),
    setMapDebugGuides: (mapDebugGuides) => set({ mapDebugGuides }),
    tleRecords: [],
    tleCategory: 'visual',
    tleLoading: false,
    tleError: null,
    refreshKey: 0,
    simulatedTimeOffset: 0,
    selectedLiveSatNoradId: null,
    hoveredLiveSatNoradId: null,
    setTleRecords: (tleRecords) => set({ tleRecords }),
    setTleCategory: (tleCategory) => set({ tleCategory }),
    setTleLoading: (tleLoading) => set({ tleLoading }),
    setTleError: (tleError) => set({ tleError }),
    triggerRefresh: () => set((state) => ({ refreshKey: state.refreshKey + 1 })),
    setSimulatedTimeOffset: (simulatedTimeOffset) => set({ simulatedTimeOffset }),
    setSelectedLiveSatNoradId: (selectedLiveSatNoradId) => set({ selectedLiveSatNoradId }),
    setHoveredLiveSatNoradId: (hoveredLiveSatNoradId) => set({ hoveredLiveSatNoradId }),
    setSelectedAsset: (asset) => set({ selectedAsset: asset }),
    searchQuery: '',
    setSearchQuery: (searchQuery) => set({ searchQuery }),
    highlightedCountryCode: null,
    setHighlightedCountryCode: (highlightedCountryCode) => set({ highlightedCountryCode }),
    isSidebarOpen: false,
    setSidebarOpen: (isSidebarOpen) => set({ isSidebarOpen }),
}))
