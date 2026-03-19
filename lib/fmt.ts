const safe = (n: number) => (!n || isNaN(n) || !isFinite(n)) ? 0 : n

export const fmt = {
  inr: (n: number) => {
    n = safe(n)
    if (Math.abs(n) >= 100000) return '₹' + (n / 100000).toFixed(1) + 'L'
    if (Math.abs(n) >= 1000)   return '₹' + (n / 1000).toFixed(1) + 'K'
    return '₹' + Math.round(n)
  },
  pct:  (n: number, d = 1) => safe(n).toFixed(d) + '%',
  x:    (n: number, d = 2) => safe(n).toFixed(d) + 'x',
  num:  (n: number) => Math.round(safe(n)).toLocaleString('en-IN'),
  raw:  (n: number, decimals = 0) => safe(n).toFixed(decimals),
}
