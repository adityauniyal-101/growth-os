'use client'
import { useState, useMemo } from 'react'
import { callClaude } from '@/lib/claude'
import { buildCurves, projectChannel, computeOptimalAlloc } from '@/lib/allocator'
import { CH, C, SAT_COLORS } from '@/lib/constants'
import { fmt } from '@/lib/fmt'
import PieChart from '@/components/charts/PieChart'
import Skeleton from '@/components/ui/Skeleton'
import type { Metrics } from '@/types'

export default function Allocator({ metrics }: { metrics: Metrics | null }) {
  if (!metrics) return (
    <div style={{ textAlign: 'center', padding: '60px 20px', color: C.mist }}>
      <div style={{ fontSize: 18, fontWeight: 600, color: C.ink, marginBottom: 12 }}>No data loaded</div>
      Upload a CSV on the Dashboard first.
    </div>
  )

  const { byChannel, total } = metrics
  const curves   = useMemo(() => buildCurves(byChannel), [byChannel])
  const curveMap = useMemo(() => Object.fromEntries(curves.map(c => [c.channel, c])), [curves])

  const [budget, setBudget] = useState(Math.round(total.spend * 1.2 / 1000) * 1000)
  const [alloc,  setAlloc]  = useState<Record<string, number>>(() => {
    const o: Record<string, number> = {}
    byChannel.forEach(c => { o[c.channel] = Math.round(100 / byChannel.length) })
    return o
  })
  const [reco, setReco]     = useState('')
  const [loading, setLoading] = useState(false)

  const sum = Object.values(alloc).reduce((a, x) => a + x, 0)

  const projections = useMemo(() => {
    const out: Record<string, ReturnType<typeof projectChannel>> = {}
    byChannel.forEach(c => { out[c.channel] = projectChannel(curveMap[c.channel], budget * (alloc[c.channel] || 0) / 100) })
    return out
  }, [byChannel, budget, alloc, curveMap])

  const projRev    = Object.values(projections).reduce((a, p) => a + p.revenue, 0)
  const projOrders = Object.values(projections).reduce((a, p) => a + p.orders, 0)
  const projROAS   = budget > 0 ? projRev / budget : 0
  const projCAC    = projOrders > 0 ? budget / projOrders : 0
  const roasDelta  = projROAS - total.roas
  const revDelta   = projRev  - byChannel.reduce((a, c) => a + c.revenue, 0)

  const slide = (ch: string, val: number) => {
    const rem      = 100 - val
    const others   = byChannel.filter(c => c.channel !== ch)
    const otherSum = others.reduce((a, c) => a + (alloc[c.channel] || 0), 0)
    const n        = { ...alloc, [ch]: val }
    others.forEach(c => { n[c.channel] = otherSum > 0 ? Math.round(alloc[c.channel] / otherSum * rem) : Math.round(rem / others.length) })
    setAlloc(n)
  }

  const optimise = () => setAlloc(computeOptimalAlloc(curves, budget))

  const getReco = async () => {
    setLoading(true)
    const d = byChannel.map(c => {
      const p = projections[c.channel]; const spd = budget * (alloc[c.channel] || 0) / 100
      return `${c.channel}: alloc ${alloc[c.channel]}% (${fmt.inr(spd)}), historical ROAS ${fmt.x(c.roas, 1)}, projected ROAS ${fmt.x(p.roas, 1)}, efficiency ${p.efficiencyPct}%, status: ${p.satStatus}`
    }).join('\n')
    const r = await callClaude(`Performance marketing strategist. Budget ${fmt.inr(budget)}. Using diminishing returns model.\n\n${d}\n\nProjected blended ROAS: ${fmt.x(projROAS, 2)} (vs historical ${fmt.x(total.roas, 2)}).\n\n4-sentence rationale: why this split makes sense given saturation curves, which channel has headroom, any over-allocated risk, one optimisation tip. Be specific about the numbers.`)
    setReco(r); setLoading(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Budget bar */}
      <div className="card fade-up" style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.07em', textTransform: 'uppercase', color: C.mist, marginBottom: 6 }}>Monthly Budget</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 20, color: C.mist }}>₹</span>
            <input type="number" value={budget} onChange={e => setBudget(+e.target.value)}
              style={{ fontSize: 24, fontWeight: 600, fontFamily: "'DM Sans',sans-serif", border: 'none', outline: 'none', width: 160, background: 'transparent' }} />
          </div>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.07em', textTransform: 'uppercase', color: C.mist, marginBottom: 4 }}>Projected Revenue</div>
          <div className="serif" style={{ fontSize: 26, lineHeight: 1 }}>{fmt.inr(projRev)}</div>
          <div style={{ fontSize: 11, marginTop: 4 }}>
            <span className={revDelta >= 0 ? 'kpi-up' : 'kpi-down'}>{revDelta >= 0 ? '↑' : '↓'} {fmt.inr(Math.abs(revDelta))} vs historical</span>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.07em', textTransform: 'uppercase', color: C.mist, marginBottom: 4 }}>Projected ROAS</div>
          <div className="serif" style={{ fontSize: 26, lineHeight: 1, color: projROAS >= 5 ? C.accent : projROAS >= 4 ? C.amber : C.red }}>{fmt.x(projROAS)}</div>
          <div style={{ fontSize: 11, marginTop: 4 }}>
            <span className={roasDelta >= 0 ? 'kpi-up' : 'kpi-down'}>{roasDelta >= 0 ? '↑' : '↓'} {Math.abs(roasDelta).toFixed(2)}x vs {fmt.x(total.roas, 2)} baseline</span>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.07em', textTransform: 'uppercase', color: C.mist, marginBottom: 4 }}>Proj. CAC</div>
          <div className="serif" style={{ fontSize: 26, lineHeight: 1, color: projCAC <= total.cpo ? C.accent : C.red }}>₹{Math.round(projCAC)}</div>
          <div style={{ fontSize: 11, marginTop: 4, color: C.mist }}>historical ₹{total.cpo}</div>
        </div>
        <button className="btn btn-outline" style={{ fontSize: 13 }} onClick={optimise}>⚡ Auto-Optimise</button>
      </div>

      {/* Sliders + pie */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }} className="alloc-row">
        <div className="card fade-up">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <div style={{ fontWeight: 600 }}>Budget Allocation</div>
            <div style={{ fontSize: 11, color: C.mist }}>Diminishing returns applied</div>
          </div>
          {byChannel.map((c, i) => {
            const p   = projections[c.channel]
            const sc  = SAT_COLORS[p.satStatus]
            const satPct = Math.min(100, Math.round((p.satRatio || 0) * 100))
            return (
              <div key={c.channel} style={{ marginBottom: 22, paddingBottom: 22, borderBottom: i < byChannel.length - 1 ? `1px solid ${C.rule}` : 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: CH[i % 4], display: 'inline-block' }} />
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{c.channel}</span>
                    <span style={{ fontSize: 11, color: C.mist }}>α={curveMap[c.channel]?.alpha.toFixed(2)}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontWeight: 700, fontSize: 14 }}>{alloc[c.channel]}%</span>
                    <span style={{ color: C.mist, fontSize: 13 }}> · {fmt.inr(budget * (alloc[c.channel] || 0) / 100)}</span>
                  </div>
                </div>
                <input type="range" min={0} max={100} value={alloc[c.channel] || 0}
                  onChange={e => slide(c.channel, +e.target.value)} style={{ marginBottom: 8 }} />
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', gap: 12, fontSize: 12 }}>
                    <span style={{ color: C.mist }}>Historical <strong>{fmt.x(c.roas, 2)}</strong></span>
                    <span>→</span>
                    <span style={{ color: p.roas >= c.roas ? C.accent : C.red, fontWeight: 600 }}>Effective {fmt.x(p.roas, 2)}</span>
                    <span style={{ color: C.mist }}>CAC ₹{p.cac}</span>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: sc.bg, color: sc.text }}>
                    {sc.label} ({satPct}% of sat.)
                  </span>
                </div>
                <div style={{ height: 3, background: C.rule, borderRadius: 2, marginTop: 6, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: Math.min(100, satPct) + '%', borderRadius: 2, transition: 'width .3s',
                    background: p.satStatus === 'sweet' ? C.accent : p.satStatus === 'approaching' ? C.amber : p.satStatus === 'saturated' ? C.red : C.blue }} />
                </div>
              </div>
            )
          })}
          <div style={{ fontSize: 12, padding: '7px 12px', borderRadius: 6, color: sum === 100 ? C.accent : C.amber, background: sum === 100 ? '#E8F3EE' : '#FEF3C7' }}>
            {sum === 100 ? '✓ Allocation sums to 100%' : `⚠ Currently ${sum}% — rebalance needed`}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="card fade-up">
            <div style={{ fontWeight: 600, marginBottom: 12 }}>Spend Distribution</div>
            <PieChart data={byChannel.map(c => ({ name: c.channel, value: alloc[c.channel] || 0 }))} />
          </div>
          <div className="card fade-up">
            <table>
              <thead><tr><th>Channel</th><th>Alloc</th><th>Spend</th><th>Eff. ROAS</th><th>Proj. Rev</th></tr></thead>
              <tbody>
                {byChannel.map((c, i) => {
                  const p = projections[c.channel]; const sc = SAT_COLORS[p.satStatus]
                  return (
                    <tr key={i}>
                      <td><span style={{ color: CH[i % 4], fontWeight: 600 }}>{c.channel}</span></td>
                      <td>{alloc[c.channel]}%</td>
                      <td>{fmt.inr(budget * (alloc[c.channel] || 0) / 100)}</td>
                      <td>
                        <span style={{ fontWeight: 600, color: p.roas >= c.roas ? C.accent : C.red }}>{fmt.x(p.roas, 2)}</span>
                        <span style={{ fontSize: 10, marginLeft: 4, padding: '1px 5px', borderRadius: 10, background: sc.bg, color: sc.text }}>{p.satStatus}</span>
                      </td>
                      <td style={{ fontWeight: 600, color: C.accent }}>{fmt.inr(p.revenue)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Warnings */}
      {byChannel.some(c => projections[c.channel]?.satStatus === 'saturated') && (
        <div className="warn-card warn-red fade-up">
          <span style={{ fontSize: 18 }}>⚠️</span>
          <span><strong>Over-saturation detected: </strong>
            {byChannel.filter(c => projections[c.channel]?.satStatus === 'saturated').map(c => c.channel).join(', ')} is beyond the saturation threshold. Redistribute spend to channels showing "Sweet spot" status.
          </span>
        </div>
      )}
      {byChannel.some(c => projections[c.channel]?.satStatus === 'under') && (
        <div className="warn-card warn-amber fade-up">
          <span style={{ fontSize: 18 }}>📉</span>
          <span><strong>Underutilised budget: </strong>
            {byChannel.filter(c => projections[c.channel]?.satStatus === 'under').map(c => c.channel).join(', ')} has spend well below the efficiency curve. Increasing allocation here will produce above-average marginal returns.
          </span>
        </div>
      )}

      {/* AI rationale */}
      <div className="card fade-up">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <div style={{ fontWeight: 600 }}>AI Allocation Rationale</div>
            <div style={{ fontSize: 12, color: C.mist, marginTop: 2 }}>Analysis uses the diminishing returns model, not just raw ROAS</div>
          </div>
          <button className="btn btn-primary" onClick={getReco} disabled={loading} style={{ fontSize: 13, padding: '8px 18px' }}>
            {loading && <span className="spinner" />}{loading ? 'Thinking…' : 'Justify This Allocation'}
          </button>
        </div>
        {loading ? <Skeleton /> : reco
          ? <div className="insight-box"><div className="insight-label">✦ Strategy Note</div>{reco}</div>
          : <div style={{ color: C.mist, fontSize: 14, padding: '10px 0' }}>Set your allocation or click Auto-Optimise, then generate a rationale.</div>}
      </div>
    </div>
  )
}
