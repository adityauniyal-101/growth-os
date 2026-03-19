export interface Row {
  date: string
  channel: string
  impressions: number
  clicks: number
  orders: number
  revenue: number
  spend: number
}

export interface ChannelMetrics {
  channel: string
  impressions: number
  clicks: number
  orders: number
  revenue: number
  spend: number
  ctr: number
  cvr: number
  roas: number
  cpc: number
}

export interface DateMetrics {
  date: string
  fullDate: string
  revenue: number
  spend: number
  orders: number
  clicks: number
  cac: number
  cvr: number
  roas: number
}

export interface TotalMetrics {
  revenue: number
  spend: number
  orders: number
  clicks: number
  roas: number
  cpo: number
}

export interface Opportunity {
  type: 'budget' | 'ctr'
  title: string
  from?: string
  to?: string
  fromRoas?: number
  toRoas?: number
  potential?: number
  channel?: string
  ctr?: number
  cvr?: number
  impact?: string
}

export interface Metrics {
  channels: string[]
  byChannel: ChannelMetrics[]
  byDate: DateMetrics[]
  total: TotalMetrics
  opps: Opportunity[]
}

export interface ChannelCurve {
  channel: string
  baseSpend: number
  baseRevenue: number
  baseOrders: number
  baseROAS: number
  alpha: number
  satPoint: number
  satMult: number
}

export type SatStatus = 'under' | 'sweet' | 'approaching' | 'saturated'

export interface ChannelProjection {
  revenue: number
  orders: number
  roas: number
  cac: number
  efficiencyPct: number
  satStatus: SatStatus
  satRatio: number
}

export interface ForecastPoint {
  x: number
  y: number
  label: string
}

export interface ForecastResult {
  historical: ForecastPoint[]
  forecast: ForecastPoint[]
  upper: ForecastPoint[]
  lower: ForecastPoint[]
  reg: { slope: number; intercept: number; r2: number; stderr: number; xBar: number; sxx: number }
  spikes: number[]
  growthRate: number
  r2: number
  n: number
}

export type DateFilter = '4w' | '8w' | '12w' | 'all' | 'custom'
export type TabId = 'dashboard' | 'allocator' | 'forecast'
