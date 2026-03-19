import type { ForecastResult } from '@/types'

interface Props {
  result: ForecastResult | null
  valueFormatter: (v: number) => string
  height?: number
}

export default function ForecastChart({ result, valueFormatter, height = 300 }: Props) {
  if (!result) return (
    <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8896AA', fontSize: 14 }}>
      Not enough data to forecast
    </div>
  )

  const { historical, forecast, upper, lower, spikes } = result
  const W = 600, H = height, PAD = { t: 20, r: 20, b: 46, l: 66 }
  const plotW = W - PAD.l - PAD.r, plotH = H - PAD.t - PAD.b

  const allY  = [...historical, ...forecast, ...upper, ...lower].map(p => p.y)
  const maxY  = Math.max(...allY) * 1.08
  const allPts = [...historical, ...forecast]
  const totalN = allPts.length
  const xScale = (i: number) => PAD.l + (i / (totalN - 1 || 1)) * plotW
  const yScale = (v: number) => PAD.t + plotH - (v / (maxY || 1)) * plotH

  const upperPath = forecast.map((_, i) => `${i === 0 ? 'M' : 'L'}${xScale(historical.length - 1 + i)},${yScale(upper[i].y)}`).join(' ')
  const lowerPath = [...forecast].reverse().map((_, i, arr) =>
    `L${xScale(historical.length - 1 + (arr.length - 1 - i))},${yScale(lower[arr.length - 1 - i].y)}`
  ).join(' ')
  const bandD   = forecast.length > 0 ? `${upperPath} ${lowerPath} Z` : ''
  const histPts = historical.map((p, i) => `${xScale(i)},${yScale(p.y)}`).join(' ')
  const fcPts   = [historical[historical.length - 1], ...forecast]
    .map((p, i) => `${xScale(historical.length - 1 + i)},${yScale(p.y)}`).join(' ')

  const todayX     = xScale(historical.length - 1)
  const labelEvery = Math.ceil(totalN / 8)

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height }}>
      {Array.from({ length: 6 }, (_, i) => {
        const v = maxY * i / 5, y = yScale(v)
        return (
          <g key={i}>
            <line x1={PAD.l} x2={W - PAD.r} y1={y} y2={y} stroke="#E8E4DE" strokeDasharray="3 3" />
            <text x={PAD.l - 6} y={y + 4} textAnchor="end" fontSize={10} fill="#8896AA">{valueFormatter(v)}</text>
          </g>
        )
      })}

      {bandD && <path d={bandD} fill="rgba(26,107,74,0.10)" />}

      {forecast.length > 0 && <>
        <polyline points={forecast.map((_, i) => `${xScale(historical.length - 1 + i)},${yScale(upper[i].y)}`).join(' ')}
          fill="none" stroke="#1A6B4A" strokeWidth={1} strokeDasharray="2 4" opacity={0.5} />
        <polyline points={forecast.map((_, i) => `${xScale(historical.length - 1 + i)},${yScale(lower[i].y)}`).join(' ')}
          fill="none" stroke="#1A6B4A" strokeWidth={1} strokeDasharray="2 4" opacity={0.5} />
      </>}

      <polyline points={histPts} fill="none" stroke="#1A6B4A" strokeWidth={2.5} />
      <polyline points={fcPts}   fill="none" stroke="#1A6B4A" strokeWidth={2} strokeDasharray="7 4" />

      {historical.map((p, i) => <circle key={i} cx={xScale(i)} cy={yScale(p.y)} r={3} fill="#1A6B4A" />)}

      {spikes.map(si => (
        <g key={si}>
          <circle cx={xScale(si)} cy={yScale(historical[si].y)} r={5} fill="none" stroke="#D97706" strokeWidth={2} />
          <text x={xScale(si)} y={yScale(historical[si].y) - 8} textAnchor="middle" fontSize={9} fill="#D97706">spike</text>
        </g>
      ))}

      {forecast.length > 0 && <>
        <circle cx={xScale(totalN - 1)} cy={yScale(forecast[forecast.length - 1].y)} r={5} fill="#1A6B4A" />
        <rect x={xScale(totalN - 1) - 28} y={yScale(forecast[forecast.length - 1].y) - 26} width={56} height={18} rx={4} fill="#1A6B4A" />
        <text x={xScale(totalN - 1)} y={yScale(forecast[forecast.length - 1].y) - 13}
          textAnchor="middle" fontSize={10} fill="#fff" fontWeight="600">
          {valueFormatter(forecast[forecast.length - 1].y)}
        </text>
      </>}

      <line x1={todayX} x2={todayX} y1={PAD.t} y2={H - PAD.b} stroke="#CBD5E1" strokeWidth={1.5} strokeDasharray="4 3" />
      <text x={todayX} y={PAD.t - 5} textAnchor="middle" fontSize={9} fill="#8896AA">latest</text>

      {allPts.map((p, i) => i % labelEvery === 0 && (
        <text key={i} x={xScale(i)} y={H - PAD.b + 14} textAnchor="middle" fontSize={9}
          fill={i >= historical.length ? '#1A6B4A' : '#8896AA'}>{p.label}</text>
      ))}

      {forecast.length > 0 && (
        <text x={xScale(historical.length - 1) + (xScale(totalN - 1) - xScale(historical.length - 1)) / 2}
          y={H - PAD.b + 28} textAnchor="middle" fontSize={9} fill="#1A6B4A" fontWeight="600">— forecast →</text>
      )}

      <g transform={`translate(${PAD.l},${H - 6})`}>
        <line x1={0} x2={14} y1={0} y2={0} stroke="#1A6B4A" strokeWidth={2.5} />
        <text x={18} y={4} fontSize={9} fill="#8896AA">Historical</text>
        <line x1={80} x2={94} y1={0} y2={0} stroke="#1A6B4A" strokeWidth={2} strokeDasharray="5 3" />
        <text x={98} y={4} fontSize={9} fill="#8896AA">Forecast</text>
        <rect x={162} y={-5} width={12} height={10} fill="rgba(26,107,74,0.15)" rx={2} />
        <text x={178} y={4} fontSize={9} fill="#8896AA">95% CI</text>
      </g>
    </svg>
  )
}
