'use client'
import { useRef, useState } from 'react'
import { useGrowthStore } from '@/store/useGrowthStore'
import { parseCSV } from '@/lib/csv'
import { SAMPLE_CSV } from '@/lib/constants'

export default function UploadScreen() {
  const { setData } = useGrowthStore()
  const ref = useRef<HTMLInputElement>(null)
  const [err, setErr] = useState('')

  const load = (text: string, name: string) => {
    try { setErr(''); setData(parseCSV(text), name) }
    catch (e) { setErr((e as Error).message) }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 24 }}>
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

      {err && (
        <div style={{ width: '100%', maxWidth: 480 }} className="err">
          {err.split('\n').map((l, i) => <div key={i}>• {l}</div>)}
        </div>
      )}

      <div className="drop-zone" style={{ width: '100%', maxWidth: 480 }} onClick={() => ref.current?.click()}>
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

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ height: 1, width: 80, background: '#E8E4DE' }} />
        <span style={{ color: '#8896AA', fontSize: 13 }}>or try sample data</span>
        <div style={{ height: 1, width: 80, background: '#E8E4DE' }} />
      </div>

      <button className="btn btn-outline" onClick={() => load(SAMPLE_CSV, 'Sample Dataset (Jan 2024)')}>
        Load Sample Data →
      </button>
    </div>
  )
}
