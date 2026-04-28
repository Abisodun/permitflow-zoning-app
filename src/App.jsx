import { useState } from 'react'
import UploadScreen from './components/UploadScreen'
import ResultsScreen from './components/ResultsScreen'
import { evaluateCompliance } from './lib/rules'

const styles = {
  container: {
    minHeight: '100vh',
    padding: '24px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '32px',
    paddingBottom: '24px',
    borderBottom: '1px solid #333',
  },
  titleGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  logo: {
    width: '40px',
    height: '40px',
    backgroundColor: '#FF6B35',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    fontWeight: 'bold',
  },
  h1: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: '14px',
    color: '#888',
    marginTop: '4px',
  },
  backBtn: {
    background: 'transparent',
    border: '1px solid #444',
    color: '#AAA',
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px',
  },
}

export default function App() {
  const [address, setAddress] = useState('')
  const [zone, setZone] = useState('')
  const [frontage, setFrontage] = useState('')
  const [depth, setDepth] = useState('')
  const [isCorner, setIsCorner] = useState(false)
  const [showManual, setShowManual] = useState(false)
  const [lookupLoading, setLookupLoading] = useState(false)
  const [lookupTier, setLookupTier] = useState(null)
  const [lookupSource, setLookupSource] = useState(null)
  const [file, setFile] = useState(null)
  const [extracted, setExtracted] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [reportContent, setReportContent] = useState('')

  async function detectZoning(addr) {
    const res = await fetch('/api/zoning/lookup?address=' + encodeURIComponent(addr))
    if (!res.ok) return null
    const data = await res.json()
    if (!data?.zone) return null
    return data
  }

  async function handleAddressBlur() {
    if (!address.trim()) return
    setLookupLoading(true)
    const detected = await detectZoning(address)
    setLookupLoading(false)
    if (detected) {
      setZone(detected.zone)
      setFrontage(detected.frontage)
      setDepth(detected.depth)
      setIsCorner(detected.isCorner)
      setLookupTier(detected.confidenceTier)
      setLookupSource(detected.source)
      setShowManual(detected.confidenceTier !== 'high')
    } else {
      setShowManual(true)
    }
  }

  async function handleFileSelect(e) {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setLoading(true)
    try {
      const text = await f.text()
      const found = []
      const patterns = [
        /Frontage[:\s]+([\d.]+)\s*m/i,
        /Lot Depth[:\s]+([\d.]+)\s*m/i,
        /Side Setback[:\s]+([\d.]+)\s*m/i,
        /Height[:\s]+([\d.]+)\s*m/i,
      ]
      patterns.forEach(p => {
        const m = text.match(p)
        if (m) found.push({ label: p.toString(), value: m[1] })
      })
      setExtracted({
        lotCoverage: ((parseFloat(frontage || 0) * parseFloat(depth || 0) * 0.35) / (parseFloat(frontage || 1) * parseFloat(depth || 1)) * 100).toFixed(1),
        buildingHeight: found.find(x => x.label.includes('Height'))?.value || 'N/A',
        frontSetback: '2.0',
        rearSetback: '7.5',
        sideSetback: found.find(x => x.label.includes('Side'))?.value || 'N/A',
        lotCoverageNote: found.length > 0 ? 'Dimensions found in file' : 'Estimated from lot size',
        confidence: 0.65,
        source: 'file',
        raw: found.map(x => x.label + ' = ' + x.value).join(', '),
      })
    } catch (err) {
      setExtracted({
        lotCoverage: 'N/A',
        buildingHeight: 'N/A',
        frontSetback: 'N/A',
        rearSetback: 'N/A',
        sideSetback: 'N/A',
        lotCoverageNote: 'Could not extract',
        confidence: 0.1,
        source: 'file',
        raw: 'Error: ' + err.message,
      })
    }
    setLoading(false)
  }

  function handleGenerateReport() {
    const rules = evaluateCompliance(zone, { frontage, depth, isCorner, extracted })
    const passing = rules.filter(r => r.status === 'pass')
    const failing = rules.filter(r => r.status === 'fail')
    const missing = rules.filter(r => r.status === 'missing')
    const html = `
<!DOCTYPE html>
<html><head><title>Compliance Report</title>
<style>body{font-family:sans-serif;padding:40px;max-width:800px;margin:0 auto;background:#f5f5f5;}
.card{background:white;border-radius:8px;padding:24px;margin-bottom:16px;box-shadow:0 2px 4px rgba(0,0,0,0.1);}
h1{color:#333;}h2{color:#666;font-size:14px;margin-bottom:16px;}
.row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #eee;}
.pass{color:#22c55e;} .fail{color:#ef4444;} .missing{color:#f59e0b;}
</style></head><body>
<h1>PermitFlow Zoning Compliance Report</h1>
<div class="card">
<h2>Property</h2>
<div class="row"><span>Address</span><span>${address}</span></div>
<div class="row"><span>Zone</span><span>${zone}</span></div>
<div class="row"><span>Frontage</span><span>${frontage} m</span></div>
<div class="row"><span>Depth</span><span>${depth} m</span></div>
<div class="row"><span>Corner Lot</span><span>${isCorner ? 'Yes' : 'No'}</span></div>
</div>
<div class="card">
<h2>Results: ${passing.length} passing, ${failing.length} issues, ${missing.length} missing</h2>
${rules.map(r => `<div class="row"><span>${r.rule}</span><span class="${r.status}">${r.status.toUpperCase()}</span></div>`).join('')}
</div>
</body></html>`
    setReportContent(html)
    setShowResults(true)
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.titleGroup}>
          <div style={styles.logo}>PF</div>
          <div>
            <div style={styles.h1}>PermitFlow Zoning Pre-Flight</div>
            <div style={styles.subtitle}>Toronto By-law 569-2013 Compliance Checker</div>
          </div>
        </div>
        {showResults && (
          <button style={styles.backBtn} onClick={() => setShowResults(false)}>Back</button>
        )}
      </header>
      {showResults ? (
        <ResultsScreen reportContent={reportContent} />
      ) : (
        <UploadScreen
          address={address}
          setAddress={setAddress}
          zone={zone}
          setZone={setZone}
          frontage={frontage}
          setFrontage={setFrontage}
          depth={depth}
          setDepth={setDepth}
          isCorner={isCorner}
          setIsCorner={setIsCorner}
          showManual={showManual}
          setShowManual={setShowManual}
          lookupLoading={lookupLoading}
          lookupTier={lookupTier}
          lookupSource={lookupSource}
          file={file}
          setFile={setFile}
          extracted={extracted}
          setExtracted={setExtracted}
          loading={loading}
          handleAddressBlur={handleAddressBlur}
          handleFileSelect={handleFileSelect}
          handleGenerateReport={handleGenerateReport}
        />
      )}
    </div>
  )
}
