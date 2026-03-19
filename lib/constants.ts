export const CH = ['#1A6B4A', '#1E4EAD', '#D97706', '#9333EA']

export const C = {
  accent:  '#1A6B4A',
  amber:   '#D97706',
  red:     '#C53030',
  blue:    '#1E4EAD',
  mist:    '#8896AA',
  rule:    '#E8E4DE',
  paper:   '#F8F7F4',
  ink:     '#0F0F0F',
}

export const SAMPLE_CSV = `date,channel,impressions,clicks,orders,revenue,spend
2024-01-01,Blinkit,52000,1820,182,54600,9100
2024-01-01,Zepto,38000,1140,91,27300,5700
2024-01-01,Meta,210000,4200,168,50400,8400
2024-01-01,Google,95000,2850,143,42900,7150
2024-01-08,Blinkit,58000,2088,220,66000,10200
2024-01-08,Zepto,41000,1312,118,35400,6500
2024-01-08,Meta,225000,4725,189,56700,9450
2024-01-08,Google,102000,3162,172,51600,8400
2024-01-15,Blinkit,61000,2318,248,74400,11200
2024-01-15,Zepto,44000,1452,132,39600,7100
2024-01-15,Meta,240000,5040,202,60600,10100
2024-01-15,Google,108000,3456,190,57000,9200
2024-01-22,Blinkit,65000,2470,265,79500,12000
2024-01-22,Zepto,47000,1598,143,42900,7800
2024-01-22,Meta,255000,5355,215,64500,10750
2024-01-22,Google,115000,3680,204,61200,9800`

export const SAT_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  under:       { bg: '#EBF0FF', text: '#1E4EAD', label: 'Underutilised' },
  sweet:       { bg: '#E8F3EE', text: '#1A6B4A', label: 'Sweet spot ✓' },
  approaching: { bg: '#FEF3C7', text: '#D97706', label: 'Near saturation' },
  saturated:   { bg: '#FFF5F5', text: '#C53030', label: 'Saturated ⚠' },
}
