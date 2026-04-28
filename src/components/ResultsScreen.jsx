const s = {
  wrap: { maxWidth: '800px', margin: '0 auto' },
  card: { background: '#1A1A1A', borderRadius: '12px', padding: '24px', marginBottom: '16px' },
  propCard: { background: '#FFFFFF', borderRadius: '12px', padding: '24px', marginBottom: '16px' },
  h1: { fontSize: '20px', fontWeight: 'bold', marginBottom: '20px', color: '#333' },
  h2: { fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', color: '#333' },
  h3: { fontSize: '16px', fontWeight: 'bold', marginBottom: '12px', color: '#333' },
  propRow: { display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #EEE', fontSize: '14px' },
  propLabel: { color: '#666', fontWeight: '500' },
  propVal: { color: '#111', fontWeight: '600' },
  resultsRow: { display: 'flex', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid #EEE', fontSize: '15px' },
  ruleName: { color: '#666' },
  statusBadge: (status) => ({
    padding: '4px 12px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 'bold',
    background: status === 'pass' ? '#22c55e' : status === 'fail' ? '#ef4444' : '#f59e0b',
    color: '#FFF',
  }),
  summary: { fontSize: '15px', color: '#666', marginBottom: '16px' },
  passCount: { color: '#22c55e', fontWeight: 'bold' },
  failCount: { color: '#ef4444', fontWeight: 'bold' },
  missingCount: { color: '#f59e0b', fontWeight: 'bold' },
  btn: { background: '#FF6B35', border: 'none', borderRadius: '6px', padding: '10px 20px', color: '#FFF', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' },
}

export default function ResultsScreen({ address, zone, frontage, depth, isCorner, results, onBack }) {
  const passing = results?.filter(r => r.status === 'pass') || []
  const failing = results?.filter(r => r.status === 'fail') || []
  const missing = results?.filter(r => r.status === 'missing') || []

  const handleDownload = () => {
    const html = `<html><body><h1>Compliance Report</h1><p>Address: ${address}</p><p>Zone: ${zone}</p></body></html>`
    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'zoning-compliance-report.html'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div style={s.wrap}>
      <div style={{ marginBottom: '20px' }}>
        <button style={{ background: 'transparent', border: '1px solid #333', color: '#AAA', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }} onClick={onBack}>
          &larr; Back
        </button>
      </div>

      <div style={s.propCard}>
        <h3 style={{ margin: '0 0 16px 0', color: '#333', fontSize: '14px', fontWeight: '600' }}>Property</h3>
        <div style={s.propRow}>
          <span style={s.propLabel}>Address</span>
          <span style={s.propVal}>{address || '—'}</span>
        </div>
        <div style={s.propRow}>
          <span style={s.propLabel}>Zone</span>
          <span style={s.propVal}>{zone || '—'}</span>
        </div>
        <div style={s.propRow}>
          <span style={s.propLabel}>Frontage</span>
          <span style={s.propVal}>{frontage ? frontage + ' m' : '—'}</span>
        </div>
        <div style={s.propRow}>
          <span style={s.propLabel}>Depth</span>
          <span style={s.propVal}>{depth ? depth + ' m' : '—'}</span>
        </div>
        <div style={s.propRow}>
          <span style={s.propLabel}>Corner Lot</span>
          <span style={s.propVal}>{isCorner ? 'Yes' : 'No'}</span>
        </div>
      </div>

      <div style={s.card}>
        <h2 style={s.h2}>Results</h2>
        <div style={s.summary}>
          Results: <span style={s.passCount}>{passing.length} passing</span>, <span style={s.failCount}>{failing.length} issues</span>, <span style={s.missingCount}>{missing.length} missing</span>
        </div>
        {results?.map(r => (
          <div key={r.rule} style={s.resultsRow}>
            <span style={s.ruleName}>{r.rule}</span>
            <span style={s.statusBadge(r.status)}>{r.status.toUpperCase()}</span>
          </div>
        ))}
      </div>

      <div style={{ textAlign: 'center', marginTop: '16px' }}>
        <button style={s.btn} onClick={handleDownload}>Download Report</button>
      </div>
    </div>
  )
}
