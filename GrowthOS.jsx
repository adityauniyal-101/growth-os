import { useState, useCallback, useRef } from "react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
// ─── Palette ────────────────────────────────────────────────────────────────
const C = {
  ink:      "#0F0F0F",
  slate:    "#4A5568",
  mist:     "#8896AA",
  paper:    "#F8F7F4",
  white:    "#FFFFFF",
  rule:     "#E8E4DE",
  accent:   "#1A6B4A",
  accentLt: "#E8F3EE",
  amber:    "#D97706",
  amberLt:  "#FEF3C7",
  red:      "#C53030",
  redLt:    "#FFF5F5",
  blue:     "#1E4EAD",
  blueLt:   "#EBF0FF",
  channels: ["#1A6B4A","#1E4EAD","#D97706","#9333EA"],
};
// ─── Fonts (Google Fonts via @import) ────────────────────────────────────────
const STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: ${C.paper}; font-family: 'DM Sans', sans-serif; color: ${C.ink}; }
  .serif { font-family: 'DM Serif Display', serif; }
  /* Tabs */
  .tab-bar { display:flex; gap:2px; background:${C.rule}; border-radius:10px; padding:3px; }
  .tab { padding:8px 20px; border-radius:8px; border:none; background:transparent; cursor:pointer;
         font-family:'DM Sans',sans-serif; font-size:13px; font-weight:500; color:${C.mist}; transition:all .2s; }
  .tab.active { background:${C.white}; color:${C.ink}; box-shadow:0 1px 4px rgba(0,0,0,.08); }
  /* Cards */
  .card { background:${C.white}; border:1px solid ${C.rule}; border-radius:14px; padding:24px; }
  .card-sm { background:${C.white}; border:1px solid ${C.rule}; border-radius:12px; padding:18px 20px; }
  /* KPI chip */
  .kpi-up   { color:${C.accent}; background:${C.accentLt}; font-size:11px; font-weight:600; padding:2px 7px; border-radius:20px; }
  .kpi-down { color:${C.red};    background:${C.redLt};    font-size:11px; font-weight:600; padding:2px 7px; border-radius:20px; }
  .kpi-flat { color:${C.amber};  background:${C.amberLt};  font-size:11px; font-weight:600; padding:2px 7px; border-radius:20px; }
  /* Upload zone */
  .drop-zone { border:2px dashed ${C.rule}; border-radius:14px; padding:40px; text-align:center; cursor:pointer; transition:all .2s; }
  .drop-zone:hover { border-color:${C.accent}; background:${C.accentLt}; }
  /* Slider */
  .slider-row { display:flex; align-items:center; gap:12px; margin-bottom:10px; }
  input[type=range] { -webkit-appearance:none; height:4px; background:${C.rule}; border-radius:2px; flex:1; outline:none; }
  input[type=range]::-webkit-slider-thumb { -webkit-appearance:none; width:16px; height:16px; border-radius:50%; background:${C.accent}; cursor:pointer; }
  /* Insight box */
  .insight-box { background: linear-gradient(135deg, #F0F7F4 0%, #EBF0FF 100%);
                 border:1px solid #C6DDD4; border-radius:14px; padding:20px; line-height:1.7; font-size:14px; }
  .insight-label { font-size:10px; font-weight:600; letter-spacing:.1em; text-transform:uppercase; color:${C.accent}; margin-bottom:8px; }
  /* Table */
  table { width:100%; border-collapse:collapse; font-size:13px; }
  th { text-align:left; font-weight:600; font-size:11px; letter-spacing:.06em; text-transform:uppercase; color:${C.mist}; padding:8px 12px; border-bottom:2px solid ${C.rule}; }
  td { padding:10px 12px; border-bottom:1px solid ${C.rule}; }
  tr:last-child td { border-bottom:none; }
  tr:hover td { background:${C.paper}; }
  /* Btn */
  .btn { padding:10px 22px; border-radius:9px; border:none; cursor:pointer; font-family:'DM Sans',sans-serif; font-weight:500; font-size:14px; transition:all .15s; }
  .btn-primary { background:${C.ink}; color:#fff; }
  .btn-primary:hover { background:#333; }
  .btn-outline { background:transparent; color:${C.ink}; border:1px solid ${C.rule}; }
  .btn-outline:hover { background:${C.paper}; }
  .btn:disabled { opacity:.45; cursor:not-allowed; }
  /* Spinner */
  @keyframes spin { to { transform: rotate(360deg); } }
  .spinner { width:18px; height:18px; border:2px solid ${C.rule}; border-top-color:${C.accent}; border-radius:50%; animation:spin .7s linear infinite; display:inline-block; vertical-align:middle; margin-right:8px; }
  /* Fade in */
  @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
  .fade-up { animation: fadeUp .4s ease forwards; }
  /* Modal */
  .modal-overlay { position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.3); display:flex; align-items:center; justify-content:center; z-index:1000; }
  .modal { background:${C.white}; border-radius:12px; padding:24px; max-width:400px; box-shadow:0 10px 40px rgba(0,0,0,0.1); }
  .modal p { margin-bottom:20px; font-size:14px; line-height:1.6; }
  .modal-buttons { display:flex; gap:12px; justify-content:flex-end; }
  /* Channel pills */
  .channel-pill { display:inline-flex; align-items:center; gap:6px; padding:4px 10px; background:${C.paper}; border:1px solid ${C.rule}; border-radius:20px; cursor:pointer; font-size:12px; transition:all .2s; margin-right:8px; margin-bottom:8px; }
  .channel-pill input[type="checkbox"] { margin:0; cursor:pointer; }
  .channel-pill:hover { border-color:${C.accent}; }
  .channel-pill.active { background:${C.accentLt}; border-color:${C.accent}; }
  /* Error message */
  .error-box { background:${C.redLt}; border:1px solid ${C.red}; border-radius:8px; padding:12px; font-size:13px; color:${C.red}; margin-bottom:12px; line-height:1.5; }
  /* Empty state */
  .empty-state { text-align:center; padding:60px 20px; color:${C.mist}; }
  .empty-state > div:first-child { font-size:18px; font-weight:600; color:${C.ink}; margin-bottom:12px; }
  /* Responsive */
  @media (max-width: 640px) {
    .card { padding:16px; }
    body { font-size:14px; }
    .kpi-grid { grid-template-columns:1fr !important; }
    .chart-row { grid-template-columns:1fr !important; }
    .allocator-row { grid-template-columns:1fr !important; }
    .header { flex-direction:column !important; gap:12px !important; }
    .tab-bar { width:100%; }
    input[type=range] { width:100%; }
    table { font-size:11px; }
    table th, table td { padding:6px 8px; }
    .insights-grid { grid-template-columns:1fr !important; }
  }
  @media (min-width: 640px) and (max-width: 1024px) {
    .kpi-grid { grid-template-columns:1fr 1fr !important; }
    .chart-row { grid-template-columns:1fr !important; }
    .allocator-row { grid-template-columns:1fr !important; }
    .insights-grid { grid-template-columns:1fr !important; }
  }
`;
// ─── Sample CSV Data ─────────────────────────────────────────────────────────
const SAMPLE_CSV = `date,channel,impressions,clicks,orders,revenue,spend
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
2024-01-22,Google,115000,3680,204,61200,9800`;
// ─── Formatters ──────────────────────────────────────────────────────────────
const Formatters = {
  inr: (n) => {
    if (n == null || isNaN(n)) return "₹0";
    if (Math.abs(n) >= 100000) return "₹" + (n / 100000).toFixed(1) + "L";
    if (Math.abs(n) >= 1000) return "₹" + (n / 1000).toFixed(1) + "K";
    return "₹" + Math.round(n);
  },
  pct: (n, decimals = 1) => {
    if (n == null || isNaN(n)) return "0%";
    return n.toFixed(decimals) + "%";
  },
  multiplier: (n, decimals = 2) => {
    if (n == null || isNaN(n)) return "0x";
    return n.toFixed(decimals) + "x";
  },
  count: (n) => {
    if (n == null || isNaN(n)) return "0";
    return Math.round(n).toLocaleString('en-IN');
  }
};
// ─── CSV Validation ──────────────────────────────────────────────────────────
function validateCSV(text) {
  // Normalize line endings — handles \r\n (Windows/Excel) and \r (old Mac)
  const normalized = text.trim().replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const lines = normalized.split("\n");
  if (lines.length < 2) return { isValid: false, errors: ["CSV must have at least a header and one data row"], rows: [] };

  const headers = lines[0].split(",").map(h => h.trim());
  const required = ["date", "channel", "impressions", "clicks", "orders", "revenue", "spend"];
  const missing = required.filter(r => !headers.includes(r));
  if (missing.length > 0) {
    return { isValid: false, errors: [`Missing columns: ${missing.join(", ")}`], rows: [] };
  }

  const errors = [];
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const vals = line.split(",");
    if (vals.length !== headers.length) {
      errors.push(`Row ${i + 1}: Expected ${headers.length} columns, got ${vals.length}`);
      continue;
    }

    const obj = {};
    let valid = true;

    headers.forEach((h, idx) => {
      const val = vals[idx]?.trim();
      if (h === "date") {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(val)) {
          errors.push(`Row ${i + 1}: date must be YYYY-MM-DD format, got "${val}"`);
          valid = false;
        }
        obj[h] = val;
      } else if (h === "channel") {
        if (!val || val.length === 0) {
          errors.push(`Row ${i + 1}: channel cannot be empty`);
          valid = false;
        }
        obj[h] = val;
      } else if (["impressions", "clicks", "orders", "revenue", "spend"].includes(h)) {
        const num = parseFloat(val);
        if (isNaN(num) || num < 0) {
          errors.push(`Row ${i + 1}: ${h} must be a non-negative number, got "${val}"`);
          valid = false;
        }
        obj[h] = num;
      }
    });

    if (valid) rows.push(obj);
  }

  if (rows.length === 0) {
    return { isValid: false, errors: ["No valid rows found in CSV"].concat(errors), rows: [] };
  }

  return { isValid: true, errors: errors.length > 0 ? errors : [], rows };
}
// ─── CSV Parser ───────────────────────────────────────────────────────────────
function parseCSV(text) {
  const validation = validateCSV(text);
  if (!validation.isValid) {
    throw new Error(validation.errors.join("\n"));
  }
  return validation.rows;
}
// ─── Opportunity Ranking ──────────────────────────────────────────────────────
function generateOpportunityRanking(byChannel, total, byDate) {
  if (!byChannel || byChannel.length === 0) return [];

  // Find top and bottom performers
  const sorted = [...byChannel].sort((a, b) => b.roas - a.roas);
  const topChannel = sorted[0];
  const bottomChannel = sorted[sorted.length - 1];

  const opportunities = [];

  // Biggest spend opportunity
  if (topChannel && bottomChannel && topChannel.channel !== bottomChannel.channel) {
    const gap = topChannel.roas - bottomChannel.roas;
    if (gap > 0.5) {
      const shiftAmount = bottomChannel.spend * 0.1;
      const projectedRevenue = shiftAmount * topChannel.roas;
      opportunities.push({
        type: "biggest_opportunity",
        title: "Biggest Budget Opportunity",
        channel: bottomChannel.channel,
        currentRoas: bottomChannel.roas,
        topRoas: topChannel.roas,
        gap: gap.toFixed(2),
        potentialRevenue: Math.round(projectedRevenue),
        actionSummary: `${bottomChannel.channel} underperforms at ${bottomChannel.roas.toFixed(1)}x ROAS vs ${topChannel.channel}'s ${topChannel.roas.toFixed(1)}x. Shift 10% spend for ~${Formatters.inr(projectedRevenue)} upside.`
      });
    }
  }

  // Tactical win - identify quick wins
  const tacticalWins = byChannel.map(ch => {
    const ctrRank = byChannel.findIndex(c => c.ctr > ch.ctr) + 1;
    const cvrRank = byChannel.findIndex(c => c.cvr > ch.cvr) + 1;
    const score = ctrRank + cvrRank;
    return { ...ch, score };
  }).sort((a, b) => a.score - b.score);

  if (tacticalWins.length > 0) {
    const win = tacticalWins[0];
    if (win.ctr > byChannel.reduce((a, c) => a + c.ctr, 0) / byChannel.length) {
      opportunities.push({
        type: "tactical_win",
        title: "Quick Win This Week",
        channel: win.channel,
        opportunity: `${win.channel} has highest CTR (${win.ctr.toFixed(1)}%) but CVR at ${win.cvr.toFixed(1)}%. Test new landing page copy.`,
        effort: "low",
        timeframe: "this_week",
        estimatedImpact: `Expected +3-5% CVR = ~${Formatters.inr(win.revenue * 0.04)} additional revenue`
      });
    }
  }

  return opportunities;
}
// ─── Derived metrics ─────────────────────────────────────────────────────────
function computeMetrics(rows) {
  const channels = [...new Set(rows.map(r => r.channel))];
  const byChannel = channels.map(ch => {
    const r = rows.filter(x => x.channel === ch);
    const imp = r.reduce((a,x) => a + (x.impressions || 0), 0);
    const clk = r.reduce((a,x) => a + (x.clicks || 0), 0);
    const ord = r.reduce((a,x) => a + (x.orders || 0), 0);
    const rev = r.reduce((a,x) => a + (x.revenue || 0), 0);
    const spd = r.reduce((a,x) => a + (x.spend || 0), 0);
    return { channel:ch, impressions:imp, clicks:clk, orders:ord,
             revenue:rev, spend:spd,
             ctr:  imp > 0 ? clk/imp*100 : 0,
             cvr:  clk > 0 ? ord/clk*100 : 0,
             roas: spd > 0 ? rev/spd     : 0,
             cpc:  clk > 0 ? spd/clk     : 0 };
  });
  const dates = [...new Set(rows.map(r => r.date))].sort();
  const byDate = dates.map(d => {
    const r = rows.filter(x => x.date === d);
    const rev = r.reduce((a,x) => a + (x.revenue || 0), 0);
    const spd = r.reduce((a,x) => a + (x.spend || 0), 0);
    const ord = r.reduce((a,x) => a + (x.orders || 0), 0);
    return { date: d.slice(5), revenue: rev, spend: spd, orders: ord,
             roas: spd > 0 ? +(rev/spd).toFixed(2) : 0 };
  });
  const total = { revenue: byChannel.reduce((a,x)=>a+x.revenue,0),
                  spend:   byChannel.reduce((a,x)=>a+x.spend,0),
                  orders:  byChannel.reduce((a,x)=>a+x.orders,0),
                  clicks:  byChannel.reduce((a,x)=>a+x.clicks,0) };
  total.roas = total.spend  > 0 ? +(total.revenue/total.spend).toFixed(2)  : 0;
  total.cpo  = total.orders > 0 ? +(total.spend/total.orders).toFixed(0)   : 0;

  const opportunities = generateOpportunityRanking(byChannel, total, byDate);

  return { channels, byChannel, byDate, total, opportunities };
}
// ─── Claude API call ──────────────────────────────────────────────────────────
async function callClaude(prompt) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method:"POST",
    headers:{"Content-Type":"application/json","x-api-key": ""},
    body: JSON.stringify({
      model:"claude-sonnet-4-20250514",
      max_tokens:1000,
      messages:[{ role:"user", content: prompt }]
    })
  });
  const data = await res.json();
  return data.content?.find(b => b.type==="text")?.text || "No response.";
}
// ─── InsightSkeleton ──────────────────────────────────────────────────────────
function InsightSkeleton() {
  return (
    <div className="insight-box" style={{opacity: 0.6}}>
      <div className="insight-label">✦ Analysis</div>
      <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
        <div style={{height: 16, background: C.rule, borderRadius: 4, width: '100%'}}/>
        <div style={{height: 16, background: C.rule, borderRadius: 4, width: '95%'}}/>
        <div style={{height: 16, background: C.rule, borderRadius: 4, width: '88%'}}/>
      </div>
    </div>
  );
}
// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KPICard({ label, value, sub, trend }) {
  const chipClass = trend === "up" ? "kpi-up" : trend === "down" ? "kpi-down" : "kpi-flat";
  const arrow = trend === "up" ? "↑" : trend === "down" ? "↓" : "→";
  return (
    <div className="card-sm fade-up" style={{flex:1,minWidth:140}}>
      <div style={{fontSize:11,fontWeight:600,letterSpacing:".07em",textTransform:"uppercase",color:C.mist,marginBottom:8}}>{label}</div>
      <div className="serif" style={{fontSize:28,fontWeight:400,lineHeight:1,marginBottom:6}}>{value}</div>
      {sub && <span className={chipClass}>{arrow} {sub}</span>}
    </div>
  );
}
// ─── Strategic Insights Section ────────────────────────────────────────────────
function StrategicInsightsSection({ opportunities }) {
  if (!opportunities || opportunities.length === 0) return null;

  return (
    <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:20}} className="insights-grid">
      {opportunities.map((opp, i) => (
        <div key={i} className="card fade-up">
          <div style={{fontWeight:600, marginBottom:14, fontSize:14}}>{opp.title}</div>

          {opp.type === "biggest_opportunity" ? (
            <div style={{lineHeight:1.7, fontSize:13}}>
              <div style={{marginBottom:12}}>
                <strong>{opp.channel}</strong> underperforming vs {opp.gap}x gap
              </div>
              <div style={{background:C.paper, padding:10, borderRadius:6, marginBottom:12, fontSize:12}}>
                <div>Current: <span style={{fontWeight:600, color:C.red}}>{Formatters.multiplier(opp.currentRoas)}</span></div>
                <div>Benchmark: <span style={{fontWeight:600, color:C.accent}}>{Formatters.multiplier(opp.topRoas)}</span></div>
              </div>
              <div style={{color:C.accent, fontWeight:500, fontSize:12}}>
                ↑ {Formatters.inr(opp.potentialRevenue)} potential revenue from 10% shift
              </div>
            </div>
          ) : (
            <div style={{lineHeight:1.7, fontSize:13}}>
              <div style={{marginBottom:12}}>
                {opp.opportunity}
              </div>
              <div style={{background:C.paper, padding:10, borderRadius:6, marginBottom:12, fontSize:12}}>
                <div style={{textTransform:"capitalize"}}>Effort: <strong>{opp.effort}</strong></div>
                <div style={{textTransform:"capitalize"}}>Timeframe: <strong>{opp.timeframe}</strong></div>
              </div>
              <div style={{color:C.accent, fontWeight:500, fontSize:12}}>
                {opp.estimatedImpact}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
// ─── Upload Screen ────────────────────────────────────────────────────────────
function UploadScreen({ onData }) {
  const inputRef = useRef();
  const [error, setError] = useState("");

  const handle = (text, name) => {
    try {
      setError("");
      onData(parseCSV(text), name);
    }
    catch(e) {
      setError(e.message);
    }
  };

  const onFile = e => {
    const f = e.target.files[0]; if(!f) return;
    const r = new FileReader();
    r.onload = ev => handle(ev.target.result, f.name);
    r.readAsText(f);
    e.target.value = ""; // Reset so the same file can be re-selected after edits
  };

  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:"60vh",gap:24}}>
      <div style={{textAlign:"center",maxWidth:480,width:"100%"}}>
        <div className="serif" style={{fontSize:36,marginBottom:10,lineHeight:1.2}}>Upload your<br/><em>performance data</em></div>
        <div style={{color:C.mist,fontSize:14,lineHeight:1.7}}>
          CSV with columns: <code style={{background:C.rule,padding:"1px 5px",borderRadius:4,fontSize:12}}>date, channel, impressions, clicks, orders, revenue, spend</code>
        </div>
      </div>

      {error && (
        <div style={{width:"100%",maxWidth:480}}>
          <div className="error-box">
            {error.split("\n").map((line, i) => <div key={i}>• {line}</div>)}
          </div>
        </div>
      )}

      <div className="drop-zone" style={{width:"100%",maxWidth:480}} onClick={()=>inputRef.current.click()}>
        <div style={{fontSize:32,marginBottom:12}}>📂</div>
        <div style={{fontWeight:500,marginBottom:4}}>Drop CSV here or click to browse</div>
        <div style={{color:C.mist,fontSize:13}}>Supports Blinkit, Zepto, Meta, Google data</div>
        <input ref={inputRef} type="file" accept=".csv" style={{display:"none"}} onChange={onFile}/>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:12}}>
        <div style={{height:1,width:80,background:C.rule}}/>
        <span style={{color:C.mist,fontSize:13}}>or try sample data</span>
        <div style={{height:1,width:80,background:C.rule}}/>
      </div>
      <button className="btn btn-outline" onClick={()=>handle(SAMPLE_CSV,"Sample Dataset (Jan 2024)")}>
        Load Sample Data →
      </button>
    </div>
  );
}
// ─── Dashboard Tab ────────────────────────────────────────────────────────────
function DashboardTab({ metrics, visibleChannels, setVisibleChannels }) {
  const { byChannel, byDate, total, opportunities } = metrics;
  const [insight, setInsight] = useState("");
  const [loading, setLoading] = useState(false);

  const filteredByChannel = byChannel.filter(c => visibleChannels.has(c.channel));
  const filteredByDate = byDate.map(d => {
    const filtered = { ...d, revenue: 0, spend: 0, orders: 0 };
    byChannel.forEach(c => {
      if (visibleChannels.has(c.channel)) {
        const dayData = byChannel.find(x => x.channel === c.channel);
        if (dayData) {
          filtered.revenue += dayData.revenue * (byDate.indexOf(d) / byDate.length);
          filtered.spend += dayData.spend * (byDate.indexOf(d) / byDate.length);
          filtered.orders += dayData.orders * (byDate.indexOf(d) / byDate.length);
        }
      }
    });
    return filtered;
  });

  const filteredTotal = {
    revenue: filteredByChannel.reduce((a,c) => a + c.revenue, 0),
    spend: filteredByChannel.reduce((a,c) => a + c.spend, 0),
    orders: filteredByChannel.reduce((a,c) => a + c.orders, 0),
    clicks: filteredByChannel.reduce((a,c) => a + c.clicks, 0),
  };
  filteredTotal.roas = filteredTotal.spend > 0 ? +(filteredTotal.revenue/filteredTotal.spend).toFixed(2) : 0;
  filteredTotal.cpo = filteredTotal.orders > 0 ? +(filteredTotal.spend/filteredTotal.orders).toFixed(0) : 0;

  const getInsight = async () => {
    setLoading(true);
    const summary = filteredByChannel.map(c =>
      `${c.channel}: Revenue ${Formatters.inr(c.revenue)}, Spend ${Formatters.inr(c.spend)}, ROAS ${c.roas.toFixed(2)}x, CTR ${c.ctr.toFixed(2)}%, CVR ${c.cvr.toFixed(2)}%`
    ).join("\n");
    const prompt = `You are a growth marketing analyst. Here is channel performance data:\n\n${summary}\n\nGive a sharp 3-sentence executive insight: what's working, what's underperforming, and one specific action to take. Be direct, no filler.`;
    const resp = await callClaude(prompt);
    setInsight(resp);
    setLoading(false);
  };

  return (
    <div style={{display:"flex",flexDirection:"column",gap:20}}>
      {/* KPIs */}
      <div style={{display:"flex",gap:14,flexWrap:"wrap"}} className="kpi-grid">
        <KPICard label="Total Revenue" value={Formatters.inr(filteredTotal.revenue)} sub="vs prev period" trend="up"/>
        <KPICard label="Total Spend"   value={Formatters.inr(filteredTotal.spend)}   sub="budget utilised" trend="flat"/>
        <KPICard label="Blended ROAS"  value={Formatters.multiplier(filteredTotal.roas)}      sub="across channels" trend={filteredTotal.roas>=4?"up":"down"}/>
        <KPICard label="Total Orders"  value={Formatters.count(filteredTotal.orders)} sub="conversions" trend="up"/>
        <KPICard label="Cost Per Order" value={"₹"+filteredTotal.cpo} sub="efficiency" trend={filteredTotal.cpo<=350?"up":"down"}/>
      </div>

      {/* Strategic Insights */}
      <StrategicInsightsSection opportunities={opportunities} />

      {/* Channel Toggle */}
      <div className="card fade-up">
        <div style={{fontWeight:600, marginBottom:12, fontSize:13}}>Filter Channels</div>
        <div style={{display:"flex", flexWrap:"wrap", gap:4}}>
          {byChannel.map((c, i) => (
            <label key={c.channel} className={`channel-pill ${visibleChannels.has(c.channel) ? 'active' : ''}`}>
              <input type="checkbox" checked={visibleChannels.has(c.channel)}
                onChange={e => {
                  const updated = new Set(visibleChannels);
                  if (e.target.checked) updated.add(c.channel);
                  else updated.delete(c.channel);
                  setVisibleChannels(updated);
                }}
              />
              <span style={{display:"inline-block", width:8, height:8, borderRadius:"50%", background:C.channels[i%4]}}/>
              {c.channel}
            </label>
          ))}
        </div>
      </div>

      {/* Charts row */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}} className="chart-row">
        <div className="card fade-up">
          <div style={{fontWeight:600,marginBottom:16}}>Revenue & Spend Trend</div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={byDate}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.rule}/>
              <XAxis dataKey="date" tick={{fontSize:11,fill:C.mist}}/>
              <YAxis tick={{fontSize:11,fill:C.mist}} tickFormatter={v=>Formatters.inr(v*1000).slice(0,-1)}/>
              <Tooltip formatter={(v,n)=>[Formatters.inr(v),n]}/>
              <Line type="monotone" dataKey="revenue" stroke={C.accent} strokeWidth={2.5} dot={false}/>
              <Line type="monotone" dataKey="spend"   stroke={C.amber}  strokeWidth={2}   dot={false} strokeDasharray="4 3"/>
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="card fade-up">
          <div style={{fontWeight:600,marginBottom:16}}>Revenue by Channel</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={filteredByChannel}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.rule}/>
              <XAxis dataKey="channel" tick={{fontSize:11,fill:C.mist}}/>
              <YAxis tick={{fontSize:11,fill:C.mist}} tickFormatter={v=>Formatters.inr(v).slice(0,-1)}/>
              <Tooltip formatter={(v)=>[Formatters.inr(v)]}/>
              <Bar dataKey="revenue" radius={[5,5,0,0]}>
                {filteredByChannel.map((_,i)=><Cell key={i} fill={C.channels[i%4]}/>)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      {/* Channel table */}
      <div className="card fade-up">
        <div style={{fontWeight:600,marginBottom:16}}>Channel Breakdown</div>
        <table>
          <thead>
            <tr>
              <th>Channel</th><th>Impressions</th><th>Clicks</th>
              <th>CTR</th><th>CVR</th><th>Orders</th>
              <th>Revenue</th><th>Spend</th><th>ROAS</th><th>CPC</th>
            </tr>
          </thead>
          <tbody>
            {filteredByChannel.map((c,i) => (
              <tr key={i}>
                <td><span style={{display:"inline-block",width:8,height:8,borderRadius:"50%",background:C.channels[i%4],marginRight:8}}/>
                  <strong>{c.channel}</strong></td>
                <td>{Formatters.count(c.impressions/1000)}K</td>
                <td>{Formatters.count(c.clicks/1000)}K</td>
                <td>{Formatters.pct(c.ctr)}</td>
                <td>{Formatters.pct(c.cvr)}</td>
                <td>{Formatters.count(c.orders)}</td>
                <td style={{fontWeight:600}}>{Formatters.inr(c.revenue)}</td>
                <td>{Formatters.inr(c.spend)}</td>
                <td>
                  <span className={c.roas >= 5 ? "kpi-up" : c.roas >= 4 ? "kpi-flat" : "kpi-down"}>
                    {Formatters.multiplier(c.roas)}
                  </span>
                </td>
                <td>₹{c.cpc.toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* AI Insight */}
      <div className="card fade-up">
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
          <div style={{fontWeight:600}}>AI Growth Insight</div>
          <button className="btn btn-primary" onClick={getInsight} disabled={loading} style={{fontSize:13,padding:"8px 16px"}}>
            {loading && <span className="spinner"/>}
            {loading ? "Analysing…" : "Generate Insight"}
          </button>
        </div>
        {loading
          ? <InsightSkeleton />
          : insight
          ? <div className="insight-box"><div className="insight-label">✦ Analysis</div>{insight}</div>
          : <div style={{color:C.mist,fontSize:14,padding:"10px 0"}}>Click "Generate Insight" to get an AI-powered analysis of your channel performance.</div>
        }
      </div>
    </div>
  );
}
// ─── Allocator Tab ────────────────────────────────────────────────────────────
function AllocatorTab({ metrics }) {
  if (!metrics) {
    return (
      <div className="empty-state">
        <div>No data yet</div>
        <div>Upload a CSV file first to see budget allocation insights.</div>
      </div>
    );
  }

  const { byChannel, total } = metrics;
  const [budget, setBudget] = useState(Math.round(total.spend * 1.2 / 1000) * 1000);
  const [alloc, setAlloc] = useState(() => {
    const obj = {};
    byChannel.forEach(c => { obj[c.channel] = Math.round(100 / byChannel.length); });
    return obj;
  });
  const [recommendation, setRecommendation] = useState("");
  const [loading, setLoading] = useState(false);

  const totalPct = Object.values(alloc).reduce((a,x)=>a+x,0);

  const adjustSlider = (ch, val) => {
    const remaining = 100 - val;
    const others = byChannel.filter(c=>c.channel!==ch);
    const newAlloc = {...alloc, [ch]: val};
    const otherTotal = others.reduce((a,c)=>a+(alloc[c.channel]||0),0);
    others.forEach(c => {
      newAlloc[c.channel] = otherTotal > 0 ? Math.round((alloc[c.channel]/otherTotal)*remaining) : Math.round(remaining/others.length);
    });
    setAlloc(newAlloc);
  };

  const projectedRev = byChannel.reduce((sum,c) => {
    const share = (alloc[c.channel]||0)/100;
    const allocSpend = budget * share;
    return sum + allocSpend * c.roas;
  },0);

  const projectedROAS = projectedRev / budget;

  const optimise = () => {
    const roasSum = byChannel.reduce((a,c)=>a+c.roas,0);
    const newAlloc = {};
    byChannel.forEach(c => { newAlloc[c.channel] = Math.round((c.roas/roasSum)*100); });
    setAlloc(newAlloc);
  };

  const getReco = async () => {
    setLoading(true);
    const chData = byChannel.map(c =>
      `${c.channel}: current ROAS ${c.roas.toFixed(2)}x, CTR ${c.ctr.toFixed(2)}%, CVR ${c.cvr.toFixed(2)}%, proposed allocation ${alloc[c.channel]}% (${Formatters.inr(budget*(alloc[c.channel]||0)/100)})`
    ).join("\n");
    const prompt = `You are a performance marketing strategist. Total budget: ${Formatters.inr(budget)}.\n\nProposed channel allocation:\n${chData}\n\nProjected blended ROAS: ${projectedROAS.toFixed(2)}x.\n\nWrite a 4-sentence allocation rationale: why this split makes sense, which channel deserves more investment and why, any risk to flag, and one optimisation tip. Be direct and specific.`;
    const resp = await callClaude(prompt);
    setRecommendation(resp);
    setLoading(false);
  };

  return (
    <div style={{display:"flex",flexDirection:"column",gap:20}}>
      {/* Budget input */}
      <div className="card fade-up" style={{display:"flex",alignItems:"center",gap:20,flexWrap:"wrap"}}>
        <div>
          <div style={{fontSize:11,fontWeight:600,letterSpacing:".07em",textTransform:"uppercase",color:C.mist,marginBottom:6}}>Total Monthly Budget</div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <span style={{fontSize:20,fontWeight:500,color:C.mist}}>₹</span>
            <input type="number" value={budget} onChange={e=>setBudget(Number(e.target.value))}
              style={{fontSize:24,fontWeight:600,fontFamily:"'DM Sans',sans-serif",border:"none",outline:"none",width:140,background:"transparent"}}/>
          </div>
        </div>
        <div style={{flex:1}}/>
        <div style={{textAlign:"right"}}>
          <div style={{fontSize:11,fontWeight:600,letterSpacing:".07em",textTransform:"uppercase",color:C.mist,marginBottom:4}}>Projected Revenue</div>
          <div className="serif" style={{fontSize:28}}>{Formatters.inr(projectedRev)}</div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{fontSize:11,fontWeight:600,letterSpacing:".07em",textTransform:"uppercase",color:C.mist,marginBottom:4}}>Projected ROAS</div>
          <div className="serif" style={{fontSize:28,color:projectedROAS>=5?C.accent:projectedROAS>=4?C.amber:C.red}}>{Formatters.multiplier(projectedROAS)}</div>
        </div>
        <button className="btn btn-outline" style={{fontSize:13}} onClick={optimise}>⚡ Auto-Optimise</button>
      </div>
      {/* Sliders */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}} className="allocator-row">
        <div className="card fade-up">
          <div style={{fontWeight:600,marginBottom:18}}>Budget Allocation</div>
          {byChannel.map((c,i) => (
            <div key={c.channel} style={{marginBottom:18}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{width:10,height:10,borderRadius:"50%",background:C.channels[i%4],display:"inline-block"}}/>
                  <span style={{fontWeight:500,fontSize:14}}>{c.channel}</span>
                  <span style={{fontSize:12,color:C.mist}}>ROAS {c.roas.toFixed(1)}x</span>
                </div>
                <div style={{fontWeight:600,fontSize:14}}>
                  {alloc[c.channel]}% · {Formatters.inr(budget*(alloc[c.channel]||0)/100)}
                </div>
              </div>
              <input type="range" min={0} max={100} value={alloc[c.channel]||0}
                onChange={e=>adjustSlider(c.channel, Number(e.target.value))}/>
            </div>
          ))}
          {totalPct === 100 && (
            <div style={{color:C.accent,fontSize:12,marginTop:8,background:C.accentLt,padding:"6px 12px",borderRadius:6}}>
              ✓ Allocation balanced at 100%
            </div>
          )}
        </div>
        {/* Pie + table */}
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <div className="card fade-up">
            <div style={{fontWeight:600,marginBottom:12}}>Spend Distribution</div>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={byChannel.map(c=>({name:c.channel,value:alloc[c.channel]||0}))}
                  cx="50%" cy="50%" outerRadius={75} innerRadius={40} paddingAngle={3} dataKey="value">
                  {byChannel.map((_,i)=><Cell key={i} fill={C.channels[i%4]}/>)}
                </Pie>
                <Tooltip formatter={(v)=>[v+"%"]}/>
                <Legend iconType="circle" iconSize={8}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="card fade-up">
            <table>
              <thead><tr><th>Channel</th><th>Alloc</th><th>₹ Spend</th><th>Proj. Rev</th></tr></thead>
              <tbody>
                {byChannel.map((c,i)=>{
                  const spd = budget*(alloc[c.channel]||0)/100;
                  return (
                    <tr key={i}>
                      <td><span style={{color:C.channels[i%4],fontWeight:600}}>{c.channel}</span></td>
                      <td>{alloc[c.channel]}%</td>
                      <td>{Formatters.inr(spd)}</td>
                      <td style={{fontWeight:600,color:C.accent}}>{Formatters.inr(spd*c.roas)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {/* AI rationale */}
      <div className="card fade-up">
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
          <div style={{fontWeight:600}}>AI Allocation Rationale</div>
          <button className="btn btn-primary" onClick={getReco} disabled={loading} style={{fontSize:13,padding:"8px 16px"}}>
            {loading && <span className="spinner"/>}
            {loading ? "Thinking…" : "Justify This Allocation"}
          </button>
        </div>
        {loading
          ? <InsightSkeleton />
          : recommendation
          ? <div className="insight-box"><div className="insight-label">✦ Strategy Note</div>{recommendation}</div>
          : <div style={{color:C.mist,fontSize:14,padding:"10px 0"}}>Adjust the sliders above or click "Auto-Optimise", then generate a rationale for your allocation.</div>
        }
      </div>
    </div>
  );
}
// ─── Root ─────────────────────────────────────────────────────────────────────
export default function GrowthOS() {
  const [rows, setRows]       = useState(null);
  const [fileName, setFN]     = useState("");
  const [tab, setTab]         = useState("dashboard");
  const [metrics, setMetrics] = useState(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [visibleChannels, setVisibleChannels] = useState(new Set());

  const onData = useCallback((parsed, name) => {
    setRows(parsed);
    setFN(name);
    setMetrics(computeMetrics(parsed));
    setVisibleChannels(new Set([...new Set(parsed.map(r => r.channel))]));
  }, []);

  const handleReset = () => {
    setShowResetConfirm(true);
  };

  const confirmReset = () => {
    setRows(null);
    setMetrics(null);
    setShowResetConfirm(false);
    setVisibleChannels(new Set());
  };

  return (
    <div style={{minHeight:"100vh",background:C.paper,display:"flex",flexDirection:"column"}}>
      <style>{STYLE}</style>
      {/* Header */}
      <div style={{background:C.white,borderBottom:`1px solid ${C.rule}`,padding:"0 32px"}}>
        <div style={{maxWidth:1100,margin:"0 auto",display:"flex",alignItems:"center",gap:20,height:60}} className="header">
          <div style={{display:"flex",alignItems:"baseline",gap:8}}>
            <span className="serif" style={{fontSize:22,letterSpacing:"-.02em"}}>🚀 Growth OS</span>
            <span style={{fontSize:11,fontWeight:600,letterSpacing:".12em",textTransform:"uppercase",color:C.mist,borderLeft:`1px solid ${C.rule}`,paddingLeft:10}}>Performance Marketing Dashboard</span>
          </div>
          {rows && (
            <>
              <div style={{flex:1}}/>
              <div className="tab-bar">
                <button className={`tab ${tab==="dashboard"?"active":""}`} onClick={()=>setTab("dashboard")}>Dashboard</button>
                <button className={`tab ${tab==="allocator"?"active":""}`} onClick={()=>setTab("allocator")}>Budget Allocator</button>
              </div>
              <div style={{flex:1}}/>
              <div style={{fontSize:12,color:C.mist,display:"flex",alignItems:"center",gap:6}}>
                <span style={{width:6,height:6,borderRadius:"50%",background:C.accent,display:"inline-block"}}/>
                {fileName}
              </div>
              <button className="btn btn-outline" style={{fontSize:12,padding:"6px 14px"}} onClick={handleReset}>↑ New Upload</button>
            </>
          )}
        </div>
      </div>
      {/* Body */}
      <div style={{maxWidth:1100,margin:"0 auto",padding:"28px 32px",width:"100%",flex:1}}>
        {!rows
          ? <UploadScreen onData={onData}/>
          : tab==="dashboard"
            ? <DashboardTab metrics={metrics} visibleChannels={visibleChannels} setVisibleChannels={setVisibleChannels}/>
            : <AllocatorTab metrics={metrics}/>
        }
      </div>
      {/* Footer */}
      <div style={{borderTop:`1px solid ${C.rule}`,padding:"20px 32px",textAlign:"center",color:C.mist,fontSize:12}}>
        Built with React, Recharts & Claude API | Performance Marketing Portfolio Project
      </div>
      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="modal-overlay">
          <div className="modal">
            <p>Upload new data? You'll lose current insights and allocations.</p>
            <div className="modal-buttons">
              <button className="btn btn-outline" onClick={() => setShowResetConfirm(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={confirmReset}>Yes, upload new</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
