'use client'
import { useState, useMemo } from 'react'
import { generateForecast } from '@/lib/forecasting'
import { C } from '@/lib/constants'
import { fmt } from '@/lib/fmt'
import KPICard from '@/components/ui/KPICard'
import ForecastChart from '@/components/charts/ForecastChart'
import type { Metrics, DateMetrics } from '@/types'

const METRICS = [
  { key: 'revenue' as keyof DateMetrics, label: 'Revenue',        formatter: (v: number) => fmt.inr(v) },
  { key: 'orders'  as keyof DateMetrics, label: 'Orders (Users)', formatter: (v: number) => fmt.num(v) },
  { key: 'cac'     as keyof DateMetrics, label: 'CAC',            formatter: (v: number) => '₹' + fmt.raw(v, 0) },
  { key: 'cvr'     as keyof DateMetrics, label: 'Conversion Rate',formatter: (v: number) => fmt.pct(v, 2) },
]
const PERIODS = [{ label: '7 days', v: 7 }, { label: '30 days', v: 30 }, { label: '90 days', v: 90 }]

export default function Forecast({ metrics }: { metrics: Metrics | null }) {
  if (!metrics) return (
    <div style={{ textAlign: 'center', padding: '60px 20px', color: C.mist }}>
      <div style={{ fontSize: 18, fontWeight: 600, color: C.ink, marginBottom: 12 }}>No data loaded</div>
      Upload a CSV on the Dashboard first.
    </div>
  )

  const { byDate } = metrics
  const [metricIdx, setMetricIdx]  = useState(0)
  const [period, setPeriod]        = useState(30)
  const [weightRecent, setWeight]  = useState(0.7)
  const [growthAdj, setGrowthAdj]  = useState(0)
  const [campaigns, setCampaigns]  = useState(true)
  const [confidence, setConf]      = useState(0.95)
  const [spendDelta, setSpendDelta] = useState(0)
  const [cvrDelta, setCvrDelta]     = useState(0)
  const [churnDelta, setChurnDelta] = useState(0)

  const selMetric = METRICS[metricIdx]

  const result = useMemo(() => generateForecast({
    byDate, metricKey: selMetric.key, periods: period,
    weightRecent, growthAdj, includeCampaigns: campaigns, confidenceLevel: confidence,
  }), [byDate, selMetric.key, period, weightRecent, growthAdj, campaigns, confidence])

  const baseEndForecast = result?.forecast[result.forecast.length - 1]?.y || 0
  const lastRevenue     = byDate[byDate.length - 1]?.revenue || 0
  const lastCAC         = byDate[byDate.length - 1]?.cac     || 0
  const spendImpactRevenue = lastRevenue * (1 + spendDelta / 100) * (1 + cvrDelta / 100)
  const spendImpactCAC     = lastCAC * (1 + spendDelta / 100) / Math.max(1 + cvrDelta / 100 + spendDelta / 100 * 0.5, 0.1)
  const churnLTVMultiplier = 1 + churnDelta / 100 * 1.5
  const scenarioRevenue    = spendImpactRevenue * churnLTVMultiplier

  const bestCase  = result?.upper[result.upper.length - 1]?.y || 0
  const worstCase = result?.lower[result.lower.length - 1]?.y || 0

  const warnings: { type: string; icon: string; msg: string }[] = []
  if (result && selMetric.key === 'cac') {
    const endCAC = result.forecast[result.forecast.length - 1]?.y || 0
    if (endCAC > 450) warnings.push({ type: 'red', icon: '⚠️', msg: `Forecasted CAC reaches ₹${Math.round(endCAC)} — exceeds ₹450 threshold. Consider optimising ad targeting or improving landing page CVR.` })
  }
  if (result && result.growthRate < 0.02 && result.growthRate > -0.01)
    warnings.push({ type: 'amber', icon: '📉', msg: `Growth is flattening at ${fmt.pct(result.growthRate * 100, 1)} WoW. Test new creatives, expand to new cohorts, or run a win-back campaign.` })
  if (result && result.r2 < 0.7)
    warnings.push({ type: 'amber', icon: '📊', msg: `Trend confidence is low (R²=${fmt.raw(result.r2, 2)}). Upload 8+ weeks of data to improve forecast accuracy.` })
  if (result && result.growthRate > 0.15)
    warnings.push({ type: 'green', icon: '🚀', msg: `Strong growth detected at ${fmt.pct(result.growthRate * 100, 1)} WoW. Double down on top-performing channels before competitors catch up.` })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Controls */}
      <div className="card fade-up">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.07em', textTransform: 'uppercase', color: C.mist, marginBottom: 10 }}>Forecast Metric</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {METRICS.map((m, i) => (
                <button key={m.key} className={`metric-pill ${metricIdx === i ? 'active' : ''}`} onClick={() => setMetricIdx(i)}>{m.label}</button>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.07em', textTransform: 'uppercase', color: C.mist, marginBottom: 10 }}>Forecast Period</div>
            <div className="seg-group">
              {PERIODS.map(p => <button key={p.v} className={`seg ${period === p.v ? 'active' : ''}`} onClick={() => setPeriod(p.v)}>{p.label}</button>)}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer', padding: '7px 14px', borderRadius: 20, border: '1.5px solid', borderColor: campaigns ? C.accent : C.rule, background: campaigns ? '#E8F3EE' : '#fff', fontWeight: 500, transition: 'all .2s' }}>
              <input type="checkbox" checked={campaigns} onChange={e => setCampaigns(e.target.checked)} style={{ display: 'none' }} />
              {campaigns ? '📣' : '📭'} Campaigns {campaigns ? 'ON' : 'OFF'}
            </label>
            <div className="seg-group">
              {[{ l: '90%', v: 0.90 }, { l: '95%', v: 0.95 }, { l: '99%', v: 0.99 }].map(c => (
                <button key={c.v} className={`seg ${confidence === c.v ? 'active' : ''}`} onClick={() => setConf(c.v)}>{c.l} CI</button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* KPI summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }} className="kpi-row">
        <KPICard label="Latest Actual" value={selMetric.formatter(byDate[byDate.length - 1]?.[selMetric.key] as number || 0)} sub="baseline" trend="flat" />
        <KPICard label="Worst Case"    value={selMetric.formatter(worstCase)} sub="lower bound"  trend="down" />
        <KPICard label="Base Forecast" value={selMetric.formatter(baseEndForecast)} sub={`in ${period} days`} trend="up" />
        <KPICard label="Best Case"     value={selMetric.formatter(bestCase)} sub="upper bound"  trend="flat" />
      </div>

      {warnings.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {warnings.map((w, i) => (
            <div key={i} className={`warn-card warn-${w.type} fade-up`}>
              <span style={{ fontSize: 18, flexShrink: 0 }}>{w.icon}</span>
              <span>{w.msg}</span>
            </div>
          ))}
        </div>
      )}

      {/* Chart + tuning */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 14 }} className="fc-grid">
        <div className="card fade-up">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ fontWeight: 600 }}>{selMetric.label} Forecast · {period}-day horizon</div>
            {result && <span style={{ fontSize: 12, color: C.mist }}>R² {fmt.raw(result.r2, 2)} · {result.n} data pts</span>}
          </div>
          <ForecastChart result={result} valueFormatter={selMetric.formatter} height={300} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="card fade-up">
            <div style={{ fontWeight: 600, marginBottom: 16 }}>Tune Assumptions</div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                <span>Weight Recent Data</span><strong>{Math.round(weightRecent * 100)}%</strong>
              </div>
              <input type="range" min={0} max={1} step={0.05} value={weightRecent} onChange={e => setWeight(+e.target.value)} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: C.mist, marginTop: 2 }}>
                <span>All equal</span><span>Recent priority</span>
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                <span>Growth Scenario</span>
                <strong style={{ color: growthAdj > 0 ? C.accent : growthAdj < 0 ? C.red : C.mist }}>{growthAdj > 0 ? '+' : ''}{growthAdj}%</strong>
              </div>
              <input type="range" min={-30} max={30} step={5} value={growthAdj} onChange={e => setGrowthAdj(+e.target.value)} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: C.mist, marginTop: 2 }}>
                <span>−30% bear</span><span>+30% bull</span>
              </div>
            </div>
          </div>
          <div className="card fade-up">
            <div style={{ fontWeight: 600, marginBottom: 14 }}>Scenario Range</div>
            <table>
              <thead><tr><th>Scenario</th><th>Value</th><th>vs. Now</th></tr></thead>
              <tbody>
                {[{ label: '🐻 Worst', v: worstCase, cl: 'kpi-down' }, { label: '📈 Base', v: baseEndForecast, cl: 'kpi-flat' }, { label: '🚀 Best', v: bestCase, cl: 'kpi-up' }].map(s => {
                  const base  = (byDate[byDate.length - 1]?.[selMetric.key] as number) || 1
                  const delta = base > 0 ? (s.v - base) / base * 100 : 0
                  return (
                    <tr key={s.label}>
                      <td style={{ fontWeight: 500 }}>{s.label}</td>
                      <td style={{ fontWeight: 600 }}>{selMetric.formatter(s.v)}</td>
                      <td><span className={s.cl}>{delta >= 0 ? '+' : ''}{delta.toFixed(1)}%</span></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Scenario simulation */}
      <div className="card fade-up">
        <div style={{ fontWeight: 600, marginBottom: 6 }}>Scenario Simulation</div>
        <div style={{ color: C.mist, fontSize: 13, marginBottom: 20 }}>Adjust levers to model "what-if" outcomes on top of the forecast.</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20, marginBottom: 24 }} className="scenario-row">
          {[
            { label: '📣 Marketing Spend', val: spendDelta, setter: setSpendDelta, min: -50, max: 100, step: 5, hint: 'Impacts revenue & CAC proportionally' },
            { label: '🎯 Conversion Rate', val: cvrDelta,   setter: setCvrDelta,   min: -5,  max: 10,  step: 0.5, hint: 'Shifts revenue without changing spend' },
            { label: '🔄 Churn Reduction', val: churnDelta, setter: setChurnDelta, min: 0,   max: 50,  step: 5, hint: 'Improves LTV multiplier by 1.5×' },
          ].map(s => (
            <div key={s.label}>
              <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 8 }}>
                {s.label} <strong style={{ color: s.val >= 0 ? C.accent : C.red }}>{s.val >= 0 ? '+' : ''}{s.val}{s.label.includes('Rate') ? 'pp' : '%'}</strong>
              </div>
              <input type="range" min={s.min} max={s.max} step={s.step} value={s.val} onChange={e => s.setter(+e.target.value)} />
              <div style={{ fontSize: 11, color: C.mist, marginTop: 4 }}>{s.hint}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }} className="scenario-row">
          {[
            { label: 'Projected Revenue', value: fmt.inr(scenarioRevenue),        base: lastRevenue, actual: scenarioRevenue,    invertTrend: false },
            { label: 'Projected CAC',     value: '₹' + Math.round(spendImpactCAC), base: lastCAC,   actual: spendImpactCAC,     invertTrend: true },
            { label: 'LTV Multiplier',    value: fmt.raw(churnLTVMultiplier, 2) + 'x', base: 1,     actual: churnLTVMultiplier, invertTrend: false },
          ].map((s, i) => {
            const delta = s.base > 0 ? (s.actual - s.base) / s.base * 100 : 0
            const good  = s.invertTrend ? delta <= 0 : delta >= 0
            return (
              <div key={i} style={{ background: C.paper, borderRadius: 12, padding: '16px 18px', border: '1px solid', borderColor: good ? '#C6DDD4' : delta === 0 ? C.rule : '#FCA5A5' }}>
                <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.07em', textTransform: 'uppercase', color: C.mist, marginBottom: 8 }}>{s.label}</div>
                <div className="serif" style={{ fontSize: 24, marginBottom: 6, color: good ? C.accent : delta === 0 ? C.ink : C.red }}>{s.value}</div>
                <span className={good ? 'kpi-up' : delta === 0 ? 'kpi-flat' : 'kpi-down'}>{delta >= 0 ? '+' : ''}{delta.toFixed(1)}% vs now</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
