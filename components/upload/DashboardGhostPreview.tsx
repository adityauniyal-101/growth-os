'use client'
import { CH, C } from '@/lib/constants'
import KPICard from '@/components/ui/KPICard'
import LineChart from '@/components/charts/LineChart'
import BarChart from '@/components/charts/BarChart'

export default function DashboardGhostPreview() {
  // Dummy data for ghost preview
  const dummyTrend = [
    { date: '2024-01-01', spend: 45000, revenue: 180000 },
    { date: '2024-01-08', spend: 48000, revenue: 192000 },
    { date: '2024-01-15', spend: 52000, revenue: 210000 },
    { date: '2024-01-22', spend: 55000, revenue: 225000 },
    { date: '2024-01-29', spend: 58000, revenue: 240000 },
  ]

  const dummyChannels = [
    { channel: 'Blinkit', revenue: 85000 },
    { channel: 'Zepto', revenue: 62000 },
    { channel: 'Meta', revenue: 78000 },
    { channel: 'Google', revenue: 75000 },
  ]

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      pointerEvents: 'none',
      filter: 'blur(4px)',
      opacity: 0.35,
      display: 'flex',
      flexDirection: 'column',
      gap: 20,
      padding: 28,
      paddingTop: 80,
      overflow: 'hidden',
      zIndex: 0,
    }}>
      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        <KPICard label="ROAS" value="3.2x" sub="blended" trend="up" />
        <KPICard label="Total Spend" value="₹1,24,000" sub="allocated" trend="flat" />
        <KPICard label="Revenue" value="₹3,98,000" sub="generated" trend="up" />
        <KPICard label="Avg CTR" value="2.4%" sub="across channels" trend="up" />
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '60fr 40fr', gap: 24 }}>
        {/* Time Series Chart */}
        <div style={{
          background: '#fff',
          border: '1px solid #E8E4DE',
          borderRadius: 14,
          padding: 24,
        }}>
          <div style={{ fontWeight: 600, marginBottom: 16, fontSize: 14 }}>Revenue & Spend Trend</div>
          <LineChart
            data={dummyTrend}
            lines={[
              { key: 'revenue', color: C.accent, label: 'Revenue' },
              { key: 'spend', color: C.amber, label: 'Spend', dashed: true },
            ]}
            height={180}
          />
        </div>

        {/* Channel Breakdown Chart */}
        <div style={{
          background: '#fff',
          border: '1px solid #E8E4DE',
          borderRadius: 14,
          padding: 24,
        }}>
          <div style={{ fontWeight: 600, marginBottom: 16, fontSize: 14 }}>Revenue by Channel</div>
          <BarChart
            data={dummyChannels}
            valueKey="revenue"
            labelKey="channel"
            colorFn={(i) => CH[i % 4]}
            height={180}
          />
        </div>
      </div>
    </div>
  )
}
