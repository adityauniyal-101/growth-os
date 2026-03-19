import type { DateMetrics, ForecastPoint, ForecastResult } from '@/types'

interface RegResult {
  slope: number; intercept: number; r2: number
  stderr: number; xBar: number; sxx: number
}

function linReg(pts: { x: number; y: number }[], weights?: number[]): RegResult {
  const n = pts.length
  if (n < 2) return { slope: 0, intercept: pts[0]?.y || 0, r2: 0, stderr: 0, xBar: 0, sxx: 1 }
  const w = weights || Array(n).fill(1)
  const sw   = w.reduce((a, x) => a + x, 0)
  const swx  = pts.reduce((a, p, i) => a + w[i] * p.x, 0)
  const swy  = pts.reduce((a, p, i) => a + w[i] * p.y, 0)
  const swxy = pts.reduce((a, p, i) => a + w[i] * p.x * p.y, 0)
  const swx2 = pts.reduce((a, p, i) => a + w[i] * p.x * p.x, 0)
  const denom = sw * swx2 - swx * swx
  if (Math.abs(denom) < 1e-10) return { slope: 0, intercept: swy / sw, r2: 0, stderr: 0, xBar: swx / sw, sxx: 1 }
  const slope     = (sw * swxy - swx * swy) / denom
  const intercept = (swy - slope * swx) / sw
  const xBar      = swx / sw
  const sxx       = swx2 - swx * swx / sw
  const yMean     = swy / sw
  const ssTot     = pts.reduce((a, p, i) => a + w[i] * (p.y - yMean) ** 2, 0)
  const ssRes     = pts.reduce((a, p, i) => a + w[i] * (p.y - (slope * p.x + intercept)) ** 2, 0)
  const r2        = ssTot > 0 ? Math.max(0, 1 - ssRes / ssTot) : 0
  const stderr    = n > 2 ? Math.sqrt(ssRes / (n - 2)) : Math.abs(slope) * 0.2
  return { slope, intercept, r2, stderr, xBar, sxx }
}

function movingAvg(values: number[], window = 3): number[] {
  return values.map((_, i) => {
    const s     = Math.max(0, i - window + 1)
    const slice = values.slice(s, i + 1)
    return slice.reduce((a, v) => a + v, 0) / slice.length
  })
}

function growthStats(values: number[]) {
  if (values.length < 2) return { avg: 0, std: 0 }
  const rates: number[] = []
  for (let i = 1; i < values.length; i++) {
    if (values[i - 1] > 0) rates.push((values[i] - values[i - 1]) / values[i - 1])
  }
  if (!rates.length) return { avg: 0, std: 0 }
  const avg = rates.reduce((a, v) => a + v, 0) / rates.length
  const std = Math.sqrt(rates.reduce((a, v) => a + (v - avg) ** 2, 0) / rates.length)
  return { avg, std }
}

function detectSpikes(values: number[], reg: RegResult): number[] {
  const residuals = values.map((v, i) => v - (reg.slope * i + reg.intercept))
  const mean      = residuals.reduce((a, v) => a + v, 0) / residuals.length
  const std       = Math.sqrt(residuals.reduce((a, v) => a + (v - mean) ** 2, 0) / residuals.length)
  return residuals.map((r, i) => Math.abs(r - mean) > 2 * std ? i : -1).filter(i => i >= 0)
}

export interface ForecastParams {
  byDate: DateMetrics[]
  metricKey: keyof DateMetrics
  periods: number
  weightRecent: number
  growthAdj: number
  includeCampaigns: boolean
  confidenceLevel?: number
}

export function generateForecast(params: ForecastParams): ForecastResult | null {
  const { byDate, metricKey, periods, weightRecent, growthAdj, includeCampaigns, confidenceLevel = 0.95 } = params
  if (!byDate || byDate.length < 2) return null

  const raw = byDate.map((d, i) => ({ x: i, y: (d[metricKey] as number) || 0, label: d.date }))
  const n   = raw.length
  const wArr = raw.map((_, i) => {
    const recency = i / (n - 1)
    return 1 + (weightRecent - 0.5) * 2 * recency
  })

  const baseReg    = linReg(raw, wArr)
  const spikes     = detectSpikes(raw.map(p => p.y), baseReg)
  const cleanPts   = includeCampaigns ? raw : raw.filter((_, i) => !spikes.includes(i))
  const cleanW     = includeCampaigns ? wArr : wArr.filter((_, i) => !spikes.includes(i))
  const reg        = cleanPts.length >= 2 ? linReg(cleanPts, cleanW) : baseReg

  const smoothed      = movingAvg(raw.map(p => p.y), 2)
  const seasonFactors = raw.map((p, i) => smoothed[i] > 0 ? p.y / smoothed[i] : 1)

  const lastDate      = new Date(byDate[byDate.length - 1].fullDate)
  const dayInterval   = byDate.length > 1
    ? (new Date(byDate[byDate.length - 1].fullDate).getTime() - new Date(byDate[0].fullDate).getTime()) / (byDate.length - 1) / 86400000
    : 7
  const periodsPerDataPoint = Math.max(1, dayInterval / 7)
  const steps               = Math.ceil(periods / dayInterval)
  const growthStats_        = growthStats(raw.map(p => p.y))
  const adjGrowthPerStep    = (growthAdj / 100) * periodsPerDataPoint / (periods / 7)
  const z = confidenceLevel === 0.95 ? 1.96 : confidenceLevel === 0.90 ? 1.645 : 2.576

  const forecastPts: ForecastPoint[] = []
  const upperPts: ForecastPoint[]    = []
  const lowerPts: ForecastPoint[]    = []

  for (let s = 1; s <= steps; s++) {
    const xi       = n - 1 + s
    const trend    = reg.slope * xi + reg.intercept
    const sf       = seasonFactors[xi % Math.max(seasonFactors.length, 1)] || 1
    const adjusted = Math.max(0, trend * (1 + adjGrowthPerStep * s) * (includeCampaigns ? sf : 1))
    const se       = reg.stderr * Math.sqrt(1 + 1 / n + (xi - reg.xBar) ** 2 / Math.max(reg.sxx, 1))
    const d        = new Date(lastDate)
    d.setDate(d.getDate() + Math.round(s * dayInterval))
    const label = `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`
    forecastPts.push({ x: xi, y: adjusted, label })
    upperPts.push({ x: xi, y: adjusted + z * se, label })
    lowerPts.push({ x: xi, y: Math.max(0, adjusted - z * se), label })
  }

  return {
    historical: raw, forecast: forecastPts, upper: upperPts, lower: lowerPts,
    reg, spikes, growthRate: growthStats_.avg, r2: reg.r2, n,
  }
}
