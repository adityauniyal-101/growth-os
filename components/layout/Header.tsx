'use client'
import { useGrowthStore } from '@/store/useGrowthStore'
import type { TabId } from '@/types'

const TABS: { id: TabId; label: string }[] = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'allocator', label: 'Budget Allocator' },
  { id: 'forecast',  label: '📈 Forecasting' },
]

export default function Header() {
  const { rows, fileName, tab, setTab, setShowResetConfirm } = useGrowthStore()

  return (
    <div style={{ background: '#fff', borderBottom: '1px solid #E8E4DE', padding: '0 32px', position: 'sticky', top: 0, zIndex: 100 }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 16, height: 60 }} className="hdr">
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexShrink: 0 }}>
          <span className="serif" style={{ fontSize: 22, letterSpacing: '-.02em' }}>🚀 Growth OS</span>
          <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.12em', textTransform: 'uppercase', color: '#8896AA', borderLeft: '1px solid #E8E4DE', paddingLeft: 10 }}>
            Performance Marketing
          </span>
        </div>

        {rows && (
          <>
            <div style={{ flex: 1 }} />
            <div className="tab-bar">
              {TABS.map(t => (
                <button key={t.id} className={`tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
                  {t.label}
                </button>
              ))}
            </div>
            <div style={{ flex: 1 }} />
            <span style={{ fontSize: 12, color: '#8896AA', display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#1A6B4A', display: 'inline-block' }} />
              {fileName}
            </span>
            <button className="btn btn-outline" style={{ fontSize: 12, padding: '6px 14px', flexShrink: 0 }}
              onClick={() => setShowResetConfirm(true)}>
              ↑ New Upload
            </button>
          </>
        )}
      </div>
    </div>
  )
}
