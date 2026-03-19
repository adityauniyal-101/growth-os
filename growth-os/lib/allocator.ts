import type { ChannelMetrics, ChannelCurve, ChannelProjection, SatStatus } from '@/types'

const ALPHA_MAP = [
  { keys: ['blinkit', 'blink'],                    alpha: 0.72, satMult: 2.2 },
  { keys: ['zepto', 'zep'],                         alpha: 0.70, satMult: 2.0 },
  { keys: ['swiggy', 'instamart'],                  alpha: 0.71, satMult: 2.1 },
  { keys: ['meta', 'facebook', 'instagram', 'fb'],  alpha: 0.65, satMult: 3.2 },
  { keys: ['google', 'goog', 'sem', 'search'],      alpha: 0.76, satMult: 3.5 },
]
const DEFAULT_CURVE = { alpha: 0.72, satMult: 2.5 }

function curveParamsFor(channelName: string) {
  const k = channelName.toLowerCase()
  for (const row of ALPHA_MAP) {
    if (row.keys.some(kw => k.includes(kw))) return { alpha: row.alpha, satMult: row.satMult }
  }
  return DEFAULT_CURVE
}

export function buildCurves(byChannel: ChannelMetrics[]): ChannelCurve[] {
  return byChannel.map(c => {
    const { alpha, satMult } = curveParamsFor(c.channel)
    return {
      channel: c.channel, baseSpend: c.spend, baseRevenue: c.revenue,
      baseOrders: c.orders, baseROAS: c.roas, alpha, satPoint: c.spend * satMult, satMult,
    }
  })
}

export function projectChannel(curve: ChannelCurve, newSpend: number): ChannelProjection {
  const empty: ChannelProjection = { revenue: 0, orders: 0, roas: 0, cac: 0, efficiencyPct: 0, satStatus: 'under', satRatio: 0 }
  if (!curve || newSpend <= 0 || curve.baseSpend <= 0) return empty

  const ratio    = newSpend / curve.baseSpend
  const satRatio = newSpend / curve.satPoint

  let revenue = curve.baseRevenue * Math.pow(ratio, curve.alpha)
  if (satRatio > 1) {
    revenue *= Math.max(0.40, 1 - (satRatio - 1) * 0.22)
  }

  let orders = curve.baseOrders * Math.pow(ratio, curve.alpha * 0.88)
  if (satRatio > 1) {
    orders *= Math.max(0.45, 1 - (satRatio - 1) * 0.18)
  }
  orders = Math.max(0, Math.round(orders))

  const roas         = newSpend > 0 ? revenue / newSpend : 0
  const cac          = orders   > 0 ? newSpend / orders  : 0
  const efficiencyPct = Math.min(100, Math.round((roas / Math.max(curve.baseROAS, 0.01)) * 100))

  const satStatus: SatStatus =
    satRatio < 0.6  ? 'under' :
    satRatio < 0.9  ? 'sweet' :
    satRatio < 1.2  ? 'approaching' : 'saturated'

  return { revenue, orders, roas, cac: Math.round(cac), efficiencyPct, satStatus, satRatio }
}

export function computeOptimalAlloc(curves: ChannelCurve[], totalBudget: number): Record<string, number> {
  let spends = Object.fromEntries(curves.map(c => [c.channel, totalBudget / curves.length]))

  for (let iter = 0; iter < 200; iter++) {
    const marginals = curves.map(c => {
      const s = spends[c.channel]
      if (s <= 0 || c.baseSpend <= 0) return { ch: c.channel, m: 0 }
      const satRatio = s / c.satPoint
      let m = c.alpha * c.baseRevenue * Math.pow(s / c.baseSpend, c.alpha - 1) / c.baseSpend
      if (satRatio > 1) m *= Math.max(0.20, 1 - (satRatio - 1) * 0.40)
      return { ch: c.channel, m: Math.max(0, m) }
    })
    const sumM = marginals.reduce((a, x) => a + x.m, 0)
    if (sumM <= 0) break
    const newSpends = Object.fromEntries(marginals.map(({ ch, m }) => [ch, (m / sumM) * totalBudget]))
    const maxDelta  = curves.reduce((a, c) => Math.max(a, Math.abs(newSpends[c.channel] - spends[c.channel])), 0)
    spends = newSpends
    if (maxDelta < 1) break
  }

  const pcts: Record<string, number> = {}
  curves.forEach(c => { pcts[c.channel] = Math.max(1, Math.round(spends[c.channel] / totalBudget * 100)) })
  const total100 = Object.values(pcts).reduce((a, x) => a + x, 0)
  const maxCh    = curves.reduce((a, c) => pcts[c.channel] > pcts[a] ? c.channel : a, curves[0].channel)
  pcts[maxCh]   += 100 - total100
  return pcts
}
