'use client'
import { useState, useMemo, useEffect } from 'react'
import { useGrowthStore } from '@/store/useGrowthStore'
import { compute } from '@/lib/metrics'
import { callClaude } from '@/lib/claude'
import { CH, C } from '@/lib/constants'
import { fmt } from '@/lib/fmt'
import KPICard from '@/components/ui/KPICard'
import Skeleton from '@/components/ui/Skeleton'
import LineChart from '@/components/charts/LineChart'
import BarChart from '@/components/charts/BarChart'
import type { DateFilter } from '@/types'

function OpportunityCards({ opps }: { opps: ReturnType<typeof compute>['opps'] }) {
  if (!opps?.length) return null
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }} className="opp-row">
      {opps.map((o, i) => (
        <div key={i} className="card fade-up" style={{ borderLeft: `3px solid ${i === 0 ? C.accent : C.amber}` }}>
          <div style={{ fontWeight: 600, marginBottom: 12 }}>{o.title}</div>
          {o.type === 'budget' ? (
            <div style={{ fontSize: 13, lineHeight: 1.8 }}>
              <strong>{o.from}</strong> underperforms vs <strong>{o.to}</strong>
              <div style={{ display: 'flex', gap: 20, background: C.paper, padding: '8px 12px', borderRadius: 8, margin: '10px 0', fontSize: 12 }}>
                <span>Now: <strong style={{ color: C.red }}>{fmt.x(o.fromRoas!)}</strong></span>
                <span>Target: <strong style={{ color: C.accent }}>{fmt.x(o.toRoas!)}</strong></span>
              </div>
              <span style={{ color: C.accent, fontWeight: 600 }}>↑ Shift 10% spend → {fmt.inr(o.potential!)} upside</span>
            </div>
          ) : (
            <div style={{ fontSize: 13, lineHeight: 1.8 }}>
              <strong>{o.channel}</strong> leads CTR ({fmt.pct(o.ctr!)}) but CVR is only {fmt.pct(o.cvr!)}
              <div style={{ background: C.paper, padding: '8px 12px', borderRadius: 8, margin: '10px 0', fontSize: 12 }}>
                A/B test landing page copy this sprint
              </div>
              <span style={{ color: C.amber, fontWeight: 600 }}>↑ +3–5% CVR ≈ {o.impact} more revenue</span>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default function Dashboard() {
  const { rows, visibleChannels, setVisibleChannels } = useGrowthStore()
  if (!rows) return null

  const allDates = useMemo(() => [...new Set(rows.map(r => r.date))].sort(), [rows])
  const [quickFilter, setQuickFilter] = useState<DateFilter>('all')
  const [customDates, setCustomDates] = useState<Set<string>>(new Set(allDates))
  const [insight, setInsight] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => { setCustomDates(new Set(allDates)); setQuickFilter('all') }, [allDates.join(',')])

  const activeDates = useMemo(() => {
    if (quickFilter === '4w')     return allDates.slice(-4)
    if (quickFilter === '8w')     return allDates.slice(-8)
    if (quickFilter === '12w')    return allDates.slice(-12)
    if (quickFilter === 'custom') return allDates.filter(d => customDates.has(d))
    return allDates
  }, [quickFilter, customDates, allDates])

  const filteredRows = useMemo(() => rows.filter(r => activeDates.includes(r.date)), [rows, activeDates])
  const metrics      = useMemo(() => compute(filteredRows), [filteredRows])
  const { byChannel, byDate, opps } = metrics

  const shown = byChannel.filter(c => visibleChannels.has(c.channel))
  const vt = {
    revenue: shown.reduce((a, c) => a + c.revenue, 0),
    spend:   shown.reduce((a, c) => a + c.spend, 0),
    orders:  shown.reduce((a, c) => a + c.orders, 0),
  }
  const vRoas = vt.spend  > 0 ? +(vt.revenue / vt.spend).toFixed(2)  : 0
  const vCpo  = vt.orders > 0 ? +(vt.spend   / vt.orders).toFixed(0) : 0

  const rangeLabel = quickFilter === 'all'    ? `All ${allDates.length} weeks`
    : quickFilter === 'custom' ? `${activeDates.length} of ${allDates.length} weeks selected`
    : `${activeDates.length} weeks (${activeDates[0]?.slice(5)} → ${activeDates[activeDates.length - 1]?.slice(5)})`

  const getInsight = async () => {
    setLoading(true)
    const s = shown.map(c => `${c.channel}: Revenue ${fmt.inr(c.revenue)}, ROAS ${c.roas.toFixed(2)}x, CTR ${fmt.pct(c.ctr)}, CVR ${fmt.pct(c.cvr)}`).join('\n')
    const r = await callClaude(`Growth marketing analyst. Data:\n\n${s}\n\n3-sentence executive insight: what's working, what's not, one specific action. Direct, no filler.`)
    setInsight(r); setLoading(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Filters */}
      <div className="card fade-up">
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 28, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 260 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div style={{ fontWeight: 600, fontSize: 13 }}>Date Range</div>
              <span style={{ fontSize: 11, color: C.mist }}>{rangeLabel}</span>
            </div>
            <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
              {([['4w', 'Last 4W'], ['8w', 'Last 8W'], ['12w', 'Last 12W'], ['all', 'All Time'], ['custom', 'Custom']] as [DateFilter, string][]).map(([v, l]) => (
                <button key={v} className={`btn ${quickFilter === v ? 'btn-active' : 'btn-outline'}`}
                  style={{ fontSize: 12, padding: '5px 12px', borderRadius: 20 }}
                  onClick={() => { setQuickFilter(v); if (v === 'custom') setCustomDates(new Set(allDates)) }}>
                  {l}
                </button>
              ))}
            </div>
            {quickFilter === 'custom' && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
                {allDates.map(d => (
                  <label key={d} className={`pill ${customDates.has(d) ? 'on' : ''}`} style={{ fontFamily: 'monospace', fontSize: 11 }}>
                    <input type="checkbox" checked={customDates.has(d)} style={{ display: 'none' }}
                      onChange={() => { const s = new Set(customDates); s.has(d) ? s.delete(d) : s.add(d); setCustomDates(s) }} />
                    {d.slice(5)}
                  </label>
                ))}
              </div>
            )}
          </div>
          <div style={{ width: 1, background: C.rule, alignSelf: 'stretch', margin: '0 4px' }} />
          <div>
            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 10 }}>Channels</div>
            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
              {byChannel.map((c, i) => (
                <label key={c.channel} className={`pill ${visibleChannels.has(c.channel) ? 'on' : ''}`}>
                  <input type="checkbox" checked={visibleChannels.has(c.channel)} style={{ display: 'none' }}
                    onChange={e => {
                      const s = new Set(visibleChannels)
                      e.target.checked ? s.add(c.channel) : s.delete(c.channel)
                      setVisibleChannels(s)
                    }} />
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: CH[i % 4], display: 'inline-block' }} />
                  {c.channel}
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 14 }} className="kpi-row">
        <KPICard label="Total Revenue"  value={fmt.inr(vt.revenue)} sub="selected period" trend="up" />
        <KPICard label="Total Spend"    value={fmt.inr(vt.spend)}   sub="budget utilised" trend="flat" />
        <KPICard label="Blended ROAS"   value={fmt.x(vRoas)}        sub="across channels" trend={vRoas >= 4 ? 'up' : 'down'} />
        <KPICard label="Total Orders"   value={fmt.num(vt.orders)}  sub="conversions"     trend="up" />
        <KPICard label="Cost Per Order" value={'₹' + vCpo}          sub="efficiency"      trend={+vCpo <= 350 ? 'up' : 'down'} />
      </div>

      <OpportunityCards opps={opps} />

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }} className="chart-row">
        <div className="card fade-up">
          <div style={{ fontWeight: 600, marginBottom: 16 }}>Revenue & Spend Trend</div>
          <LineChart data={byDate as unknown as Record<string, unknown>[]}
            lines={[{ key: 'revenue', color: C.accent, label: 'Revenue' }, { key: 'spend', color: C.amber, label: 'Spend', dashed: true }]} />
        </div>
        <div className="card fade-up">
          <div style={{ fontWeight: 600, marginBottom: 16 }}>Revenue by Channel</div>
          <BarChart data={shown as unknown as Record<string, unknown>[]}
            valueKey="revenue" labelKey="channel" colorFn={i => CH[i % 4]} />
        </div>
      </div>

      {/* Table */}
      <div className="card fade-up">
        <div style={{ fontWeight: 600, marginBottom: 16 }}>Channel Breakdown</div>
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr><th>Channel</th><th>Impressions</th><th>Clicks</th><th>CTR</th><th>CVR</th>
                <th>Orders</th><th>Revenue</th><th>Spend</th><th>ROAS</th><th>CPC</th></tr>
            </thead>
            <tbody>
              {shown.map((c, i) => (
                <tr key={i}>
                  <td><span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: CH[i % 4], marginRight: 8 }} /><strong>{c.channel}</strong></td>
                  <td>{fmt.num(c.impressions / 1000)}K</td>
                  <td>{fmt.num(c.clicks / 1000)}K</td>
                  <td>{fmt.pct(c.ctr)}</td>
                  <td>{fmt.pct(c.cvr)}</td>
                  <td>{fmt.num(c.orders)}</td>
                  <td style={{ fontWeight: 600 }}>{fmt.inr(c.revenue)}</td>
                  <td>{fmt.inr(c.spend)}</td>
                  <td><span className={c.roas >= 5 ? 'kpi-up' : c.roas >= 4 ? 'kpi-flat' : 'kpi-down'}>{fmt.x(c.roas)}</span></td>
                  <td>₹{c.cpc.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Insight */}
      <div className="card fade-up">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ fontWeight: 600 }}>AI Growth Insight</div>
          <button className="btn btn-primary" onClick={getInsight} disabled={loading} style={{ fontSize: 13, padding: '8px 18px' }}>
            {loading && <span className="spinner" />}{loading ? 'Analysing…' : 'Generate Insight'}
          </button>
        </div>
        {loading ? <Skeleton /> : insight
          ? <div className="insight-box"><div className="insight-label">✦ Analysis</div>{insight}</div>
          : <div style={{ color: C.mist, fontSize: 14, padding: '10px 0' }}>Click "Generate Insight" for an AI-powered analysis.</div>}
      </div>
    </div>
  )
}
