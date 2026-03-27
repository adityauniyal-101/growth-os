'use client'
import { useRef, useState } from 'react'
import { useGrowthStore } from '@/store/useGrowthStore'
import { parseCSV } from '@/lib/csv'
import { SAMPLE_CSV, C } from '@/lib/constants'
import DashboardGhostPreview from './DashboardGhostPreview'

export default function UploadScreen() {
  const { setData } = useGrowthStore()
  const ref = useRef<HTMLInputElement>(null)
  const [err, setErr] = useState('')

  const load = (text: string, name: string) => {
    try { setErr(''); setData(parseCSV(text), name) }
    catch (e) { setErr((e as Error).message) }
  }

  return (
    <div style={{ position: 'relative', minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {/* Ghost Preview Background (hidden on mobile) */}
      <div style={{ display: 'none' }} className="ghost-preview">
        <DashboardGhostPreview />
      </div>

      {/* Foreground Upload Card */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 20,
        width: '100%',
      }}>
        {/* Header Text */}
        <div style={{ textAlign: 'center', maxWidth: 480 }}>
          <div className="serif" style={{ fontSize: 38, lineHeight: 1.2, marginBottom: 12 }}>
            Upload your<br /><em>performance data</em>
          </div>
          <div style={{ color: '#8896AA', fontSize: 14, lineHeight: 1.7 }}>
            CSV columns:{' '}
            <code style={{ background: '#E8E4DE', padding: '1px 6px', borderRadius: 4, fontSize: 12 }}>
              date, channel, impressions, clicks, orders, revenue, spend
            </code>
          </div>
        </div>

        {/* Error Message */}
        {err && (
          <div style={{ width: '100%', maxWidth: 480 }} className="err">
            {err.split('\n').map((l, i) => <div key={i}>• {l}</div>)}
          </div>
        )}

        {/* Upload Card Container */}
        <div style={{
          background: '#fff',
          border: '1px solid #E8E4DE',
          borderRadius: 16,
          padding: 32,
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          width: '100%',
          maxWidth: 480,
        }}>
          {/* Upload Zone Label */}
          <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: C.mist, marginBottom: 16, textAlign: 'center' }}>
            Upload your CSV to unlock your dashboard
          </div>

          {/* Drop Zone */}
          <div className="drop-zone" style={{ marginBottom: 20, cursor: 'pointer' }} onClick={() => ref.current?.click()}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>📂</div>
            <div style={{ fontWeight: 500, marginBottom: 4 }}>Drop CSV here or click to browse</div>
            <div style={{ color: '#8896AA', fontSize: 13 }}>Blinkit · Zepto · Meta · Google</div>
            <input ref={ref} type="file" accept=".csv" style={{ display: 'none' }}
              onChange={e => {
                const f = e.target.files?.[0]
                if (!f) return
                const r = new FileReader()
                r.onload = ev => load(ev.target?.result as string, f.name)
                r.readAsText(f)
                e.target.value = ''
              }} />
          </div>

          {/* Sample Data Section */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{ height: 1, flex: 1, background: '#E8E4DE' }} />
            <span style={{ color: '#8896AA', fontSize: 12, whiteSpace: 'nowrap' }}>or try sample data</span>
            <div style={{ height: 1, flex: 1, background: '#E8E4DE' }} />
          </div>

          {/* Sample Data Button */}
          <button className="btn btn-primary" style={{ width: '100%', marginBottom: 24 }} onClick={() => load(SAMPLE_CSV, 'Sample Dataset (Jan 2024)')}>
            Load Sample Data →
          </button>

          {/* Feature Badges */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 8,
            justifyContent: 'center',
            paddingTop: 16,
            borderTop: '1px solid #E8E4DE',
          }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 12,
              padding: '6px 12px',
              background: '#F8F7F4',
              border: '1px solid #E8E4DE',
              borderRadius: 20,
              whiteSpace: 'nowrap',
            }}>
              📊 <span style={{ fontWeight: 500 }}>ROAS Tracking</span>
            </div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 12,
              padding: '6px 12px',
              background: '#F8F7F4',
              border: '1px solid #E8E4DE',
              borderRadius: 20,
              whiteSpace: 'nowrap',
            }}>
              📈 <span style={{ fontWeight: 500 }}>Forecast Engine</span>
            </div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 12,
              padding: '6px 12px',
              background: '#F8F7F4',
              border: '1px solid #E8E4DE',
              borderRadius: 20,
              whiteSpace: 'nowrap',
            }}>
              🔍 <span style={{ fontWeight: 500 }}>Channel Breakdown</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
