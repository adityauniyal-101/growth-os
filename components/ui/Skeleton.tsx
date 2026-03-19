export default function Skeleton() {
  return (
    <div className="insight-box" style={{ opacity: 0.6 }}>
      <div className="insight-label">✦ Analysis</div>
      {[100, 94, 86].map((w, i) => (
        <div key={i} style={{ height: 14, background: '#E8E4DE', borderRadius: 4, width: w + '%', marginBottom: 8 }} />
      ))}
    </div>
  )
}
