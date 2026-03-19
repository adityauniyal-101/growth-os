import { fmt } from '@/lib/fmt'

interface Props {
  data: Record<string, unknown>[]
  valueKey: string
  labelKey: string
  colorFn: (i: number) => string
  height?: number
}

export default function BarChart({ data, valueKey, labelKey, colorFn, height = 200 }: Props) {
  const W = 500, H = height, PAD = { t: 10, r: 10, b: 30, l: 50 }
  const vals = data.map(d => d[valueKey] as number)
  const max  = Math.max(...vals, 1)
  const bw   = (W - PAD.l - PAD.r) / data.length
  const yScale = (v: number) => H - PAD.b - (v / max) * (H - PAD.t - PAD.b)

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
      {data.map((d, i) => {
        const x  = PAD.l + i * bw + bw * 0.1
        const bW = bw * 0.8
        const y  = yScale(d[valueKey] as number)
        return (
          <g key={i}>
            <rect x={x} y={y} width={bW} height={Math.max(H - PAD.b - y, 0)} fill={colorFn(i)} rx={4} />
            <text x={x + bW / 2} y={H - PAD.b + 14} textAnchor="middle" fontSize={11} fill="#8896AA">
              {d[labelKey] as string}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
