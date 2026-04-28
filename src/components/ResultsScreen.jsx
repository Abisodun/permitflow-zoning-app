const s = {
  wrap: { maxWidth: '800px', margin: '0 auto' },
  card: { background: '#111', border: '1px solid #333', borderRadius: '12px', padding: '24px', marginBottom: '16px' },
  h1: { fontSize: '20px', fontWeight: 'bold', marginBottom: '20px', color: '#FFF' },
  h2: { fontSize: '14px', color: '#AAA', marginBottom: '12px' },
  row: { display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #222', fontSize: '14px' },
  pass: { color: '#22c55e' },
  fail: { color: '#ef4444' },
  missing: { color: '#f59e0b' },
  btn: { background: '#FF6B35', border: 'none', borderRadius: '6px', padding: '10px 20px', color: '#FFF', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' },
}

export default function ResultsScreen({ reportContent }) {
  const handleDownload = () => {
    const blob = new Blob([reportContent], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'zoning-compliance-report.html'
    a.click()
    URL.revokeObjectURL(url)
  }
  return (
    <div style={s.wrap}>
      <div style={s.card}>
        <h1 style={s.h1}>Compliance Results</h1>
        <p style={{ color: '#888', marginBottom: '16px' }}>Results have been generated. Click below to download the full HTML report.</p>
        <button style={s.btn} onClick={handleDownload}>Download Report</button>
      </div>
      <div style={s.card}>
        <h2 style={s.h2}>Report Preview</h2>
        <div dangerouslySetInnerHTML={{ __html: reportContent }} style={{ background: '#1A1A1A', borderRadius: '8px', padding: '20px' }} />
      </div>
    </div>
  )
}
