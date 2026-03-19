import type { Row, Metrics, ChannelMetrics, DateMetrics, TotalMetrics, Opportunity } from '@/types'
import { fmt } from './fmt'

export function compute(rows: Row[]): Metrics {
  const channels = [...new Set(rows.map(r => r.channel))]

  const byChannel: ChannelMetrics[] = channels.map(ch => {
    const r = rows.filter(x => x.channel === ch)
    const imp = r.reduce((a, x) => a + (x.impressions || 0), 0)
    const clk = r.reduce((a, x) => a + (x.clicks || 0), 0)
    const ord = r.reduce((a, x) => a + (x.orders || 0), 0)
    const rev = r.reduce((a, x) => a + (x.revenue || 0), 0)
    const spd = r.reduce((a, x) => a + (x.spend || 0), 0)
    return {
      channel: ch, impressions: imp, clicks: clk, orders: ord, revenue: rev, spend: spd,
      ctr:  imp > 0 ? clk / imp * 100 : 0,
      cvr:  clk > 0 ? ord / clk * 100 : 0,
      roas: spd > 0 ? rev / spd       : 0,
      cpc:  clk > 0 ? spd / clk       : 0,
    }
  })

  const dates = [...new Set(rows.map(r => r.date))].sort()
  const byDate: DateMetrics[] = dates.map(d => {
    const r = rows.filter(x => x.date === d)
    const rev = r.reduce((a, x) => a + (x.revenue || 0), 0)
    const spd = r.reduce((a, x) => a + (x.spend || 0), 0)
    const ord = r.reduce((a, x) => a + (x.orders || 0), 0)
    const clk = r.reduce((a, x) => a + (x.clicks || 0), 0)
    return {
      date: d.slice(5), fullDate: d, revenue: rev, spend: spd, orders: ord, clicks: clk,
      cac:  ord > 0 ? spd / ord       : 0,
      cvr:  clk > 0 ? ord / clk * 100 : 0,
      roas: spd > 0 ? +(rev / spd).toFixed(2) : 0,
    }
  })

  const total: TotalMetrics = {
    revenue: byChannel.reduce((a, x) => a + x.revenue, 0),
    spend:   byChannel.reduce((a, x) => a + x.spend, 0),
    orders:  byChannel.reduce((a, x) => a + x.orders, 0),
    clicks:  byChannel.reduce((a, x) => a + x.clicks, 0),
    roas: 0,
    cpo: 0,
  }
  total.roas = total.spend  > 0 ? +(total.revenue / total.spend).toFixed(2)  : 0
  total.cpo  = total.orders > 0 ? +(total.spend   / total.orders).toFixed(0) : 0

  // Opportunity detection
  const sorted = [...byChannel].sort((a, b) => b.roas - a.roas)
  const opps: Opportunity[] = []

  if (sorted.length >= 2) {
    const top = sorted[0], bot = sorted[sorted.length - 1]
    if (top.roas - bot.roas > 0.5) {
      opps.push({
        type: 'budget', title: 'Biggest Budget Opportunity',
        from: bot.channel, to: top.channel, fromRoas: bot.roas, toRoas: top.roas,
        potential: Math.round(bot.spend * 0.1 * top.roas),
      })
    }
  }

  const avgCtr  = byChannel.reduce((a, c) => a + c.ctr, 0) / byChannel.length
  const bestCtr = byChannel.reduce((a, c) => c.ctr > a.ctr ? c : a, byChannel[0])
  if (bestCtr && bestCtr.ctr > avgCtr) {
    opps.push({
      type: 'ctr', title: 'Quick Win This Week',
      channel: bestCtr.channel, ctr: bestCtr.ctr, cvr: bestCtr.cvr,
      impact: fmt.inr(bestCtr.revenue * 0.04),
    })
  }

  return { channels, byChannel, byDate, total, opps }
}
