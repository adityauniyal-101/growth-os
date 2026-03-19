'use client'
import { create } from 'zustand'
import type { Row, Metrics, DateFilter, TabId } from '@/types'
import { compute } from '@/lib/metrics'

interface GrowthStore {
  rows: Row[] | null
  fileName: string
  metrics: Metrics | null
  visibleChannels: Set<string>
  tab: TabId
  showResetConfirm: boolean

  setData: (rows: Row[], fileName: string) => void
  setVisibleChannels: (v: Set<string>) => void
  setTab: (t: TabId) => void
  setShowResetConfirm: (v: boolean) => void
  reset: () => void
}

export const useGrowthStore = create<GrowthStore>((set) => ({
  rows: null,
  fileName: '',
  metrics: null,
  visibleChannels: new Set(),
  tab: 'dashboard',
  showResetConfirm: false,

  setData: (rows, fileName) => {
    const metrics = compute(rows)
    set({ rows, fileName, metrics, visibleChannels: new Set(metrics.channels), tab: 'dashboard' })
  },

  setVisibleChannels: (v) => set({ visibleChannels: v }),
  setTab: (t) => set({ tab: t }),
  setShowResetConfirm: (v) => set({ showResetConfirm: v }),

  reset: () => set({
    rows: null, fileName: '', metrics: null,
    visibleChannels: new Set(), tab: 'dashboard', showResetConfirm: false,
  }),
}))
