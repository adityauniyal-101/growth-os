import type { Row } from '@/types'

const MONTH_MAP: Record<string, number> = {
  jan:1, feb:2, mar:3, apr:4, may:5, jun:6,
  jul:7, aug:8, sep:9, oct:10, nov:11, dec:12,
  january:1, february:2, march:3, april:4, june:6,
  july:7, august:8, september:9, october:10, november:11, december:12,
}

function toISO(y: number, m: number, d: number) {
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

export function normaliseDate(raw: string): string | null {
  const s = (raw || '').trim()
  if (!s) return null

  // YYYY-MM-DD or YYYY/MM/DD
  let m = s.match(/^(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})$/)
  if (m) {
    const [, y, mo, d] = m.map(Number)
    if (mo >= 1 && mo <= 12 && d >= 1 && d <= 31) return toISO(y, mo, d)
  }

  // DD-MM-YYYY or DD/MM/YYYY (prefer DD/MM for Indian context)
  m = s.match(/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})$/)
  if (m) {
    const [, a, b, y] = m.map(Number)
    const [d, mo] = a > 12 ? [a, b] : b > 12 ? [b, a] : [a, b]
    if (mo >= 1 && mo <= 12 && d >= 1 && d <= 31) return toISO(y, mo, d)
  }

  // DD MMM YYYY  e.g. "15 Jan 2024" or "15-Jan-2024"
  m = s.match(/^(\d{1,2})[\s\-]([a-zA-Z]+)[\s\-,]*(\d{4})$/)
  if (m) {
    const [, d, mStr, y] = m
    const mo = MONTH_MAP[mStr.toLowerCase()]
    if (mo) return toISO(+y, mo, +d)
  }

  // MMM DD YYYY  e.g. "Jan 15, 2024"
  m = s.match(/^([a-zA-Z]+)[\s\-,]+(\d{1,2})[,\s]+(\d{4})$/)
  if (m) {
    const [, mStr, d, y] = m
    const mo = MONTH_MAP[mStr.toLowerCase()]
    if (mo) return toISO(+y, mo, +d)
  }

  // MMM-YYYY → treat as 1st of month
  m = s.match(/^([a-zA-Z]+)[-\/](\d{4})$/)
  if (m) {
    const [, mStr, y] = m
    const mo = MONTH_MAP[mStr.toLowerCase()]
    if (mo) return toISO(+y, mo, 1)
  }

  // Last resort — browser's Date parser
  const native = new Date(s)
  if (!isNaN(native.getTime())) {
    return toISO(native.getFullYear(), native.getMonth() + 1, native.getDate())
  }
  return null
}

export function parseCSV(raw: string): Row[] {
  const text = raw.trim().replace(/\r\n/g, '\n').replace(/\r/g, '\n')
  const [header, ...lines] = text.split('\n')
  const keys = header.split(',').map(h => h.trim())
  const required = ['date', 'channel', 'impressions', 'clicks', 'orders', 'revenue', 'spend']
  const missing = required.filter(r => !keys.includes(r))
  if (missing.length) throw new Error('Missing columns: ' + missing.join(', '))

  const rows: Row[] = []
  const errs: string[] = []

  lines.forEach((line, i) => {
    if (!line.trim()) return
    const vals = line.split(',')
    if (vals.length !== keys.length) {
      errs.push(`Row ${i + 2}: column count mismatch`)
      return
    }
    const obj: Partial<Row> = {}
    let ok = true

    keys.forEach((k, j) => {
      const v = vals[j]?.trim()
      if (k === 'date') {
        const iso = normaliseDate(v)
        if (!iso) { errs.push(`Row ${i + 2}: unrecognised date "${v}" — try DD/MM/YYYY, Jan 15 2024, etc.`); ok = false }
        else (obj as Record<string, unknown>)[k] = iso
      } else if (k === 'channel') {
        if (!v) { errs.push(`Row ${i + 2}: empty channel`); ok = false }
        else (obj as Record<string, unknown>)[k] = v
      } else {
        const n = parseFloat(v)
        if (isNaN(n) || n < 0) { errs.push(`Row ${i + 2}: ${k} invalid "${v}"`); ok = false }
        else (obj as Record<string, unknown>)[k] = n
      }
    })

    if (ok) rows.push(obj as Row)
  })

  if (!rows.length) throw new Error(['No valid rows found', ...errs].join('\n'))
  return rows
}
