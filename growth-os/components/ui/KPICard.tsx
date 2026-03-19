interface Props {
  label: string
  value: string
  sub?: string
  trend?: 'up' | 'down' | 'flat'
}

export default function KPICard({ label, value, sub, trend }: Props) {
  const cls = trend === 'up' ? 'kpi-up' : trend === 'down' ? 'kpi-down' : 'kpi-flat'
  const arr = trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'
  return (
    <div className="card-sm fade-up">
      <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.07em', textTransform: 'uppercase', color: '#8896AA', marginBottom: 8 }}>
        {label}
      </div>
      <div className="serif" style={{ fontSize: 28, lineHeight: 1, marginBottom: 6 }}>{value}</div>
      {sub && <span className={cls}>{arr} {sub}</span>}
    </div>
  )
}
