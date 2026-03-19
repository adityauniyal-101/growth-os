import { CH } from '@/lib/constants'

interface Slice { name: string; value: number }
interface Props { data: Slice[] }

export default function PieChart({ data }: Props) {
  const W = 260, H = 200, cx = 100, cy = 100, R = 75, ri = 40
  const total = data.reduce((a, d) => a + d.value, 0) || 1
  let angle = -Math.PI / 2

  const slices = data.map((d, i) => {
    const sweep = d.value / total * Math.PI * 2
    const a1 = angle, a2 = angle + sweep
    angle = a2
    const x1 = cx + R * Math.cos(a1), y1 = cy + R * Math.sin(a1)
    const x2 = cx + R * Math.cos(a2), y2 = cy + R * Math.sin(a2)
    const ix1 = cx + ri * Math.cos(a1), iy1 = cy + ri * Math.sin(a1)
    const ix2 = cx + ri * Math.cos(a2), iy2 = cy + ri * Math.sin(a2)
    const lg = sweep > Math.PI ? 1 : 0
    return {
      path: `M ${ix1} ${iy1} L ${x1} ${y1} A ${R} ${R} 0 ${lg} 1 ${x2} ${y2} L ${ix2} ${iy2} A ${ri} ${ri} 0 ${lg} 0 ${ix1} ${iy1} Z`,
      color: CH[i % 4], label: d.name, value: d.value,
    }
  })

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: H }}>
      {slices.map((s, i) => <path key={i} d={s.path} fill={s.color} stroke="#fff" strokeWidth={2} />)}
      {slices.map((s, i) => (
        <g key={i} transform={`translate(${cx + 20},${30 + i * 22})`}>
          <rect x={100} y={-9} width={10} height={10} fill={s.color} rx={2} />
          <text x={114} y={0} fontSize={11} fill="#4A5568">{s.label} {s.value}%</text>
        </g>
      ))}
    </svg>
  )
}
