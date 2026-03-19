import { fmt } from '@/lib/fmt'

interface LineConfig { key: string; color: string; label: string; dashed?: boolean }
interface Props {
  data: Record<string, unknown>[]
  lines: LineConfig[]
  height?: number
}

export default function LineChart({ data, lines, height = 200 }: Props) {
  const W = 500, H = height, PAD = { t: 10, r: 10, b: 36, l: 55 }
  const allVals = lines.flatMap(l => data.map(d => d[l.key] as number))
  const max     = Math.max(...allVals, 1)
  const xStep   = (W - PAD.l - PAD.r) / (data.length - 1 || 1)
  const yScale  = (v: number) => H - PAD.b - (v / max) * (H - PAD.t - PAD.b)

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height }}>
      {[0, 1, 2, 3, 4].map(i => {
        const v = max * i / 4
        const y = yScale(v)
        return (
          <g key={i}>
            <line x1={PAD.l} x2={W - PAD.r} y1={y} y2={y} stroke="#E8E4DE" strokeDasharray="3 3" />
            <text x={PAD.l - 6} y={y + 4} textAnchor="end" fontSize={10} fill="#8896AA">{fmt.inr(v)}</text>
          </g>
        )
      })}
      {data.map((d, i) => (
        <text key={i} x={PAD.l + i * xStep} y={H - PAD.b + 14} textAnchor="middle" fontSize={10} fill="#8896AA">
          {d.date as string}
        </text>
      ))}
      {lines.map(l => {
        const pts = data.map((d, i) => `${PAD.l + i * xStep},${yScale(d[l.key] as number)}`).join(' ')
        return (
          <polyline key={l.key} points={pts} fill="none" stroke={l.color}
            strokeWidth={l.dashed ? 1.5 : 2.5} strokeDasharray={l.dashed ? '6 3' : undefined} />
        )
      })}
      {lines.map((l, i) => (
        <g key={l.key} transform={`translate(${PAD.l + i * 120},${H - 4})`}>
          <line x1={0} x2={16} y1={0} y2={0} stroke={l.color} strokeWidth={2} strokeDasharray={l.dashed ? '4 2' : undefined} />
          <text x={20} y={4} fontSize={10} fill="#8896AA">{l.label}</text>
        </g>
      ))}
    </svg>
  )
}
