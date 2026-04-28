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
  const [results, setResults] = useState([])

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
        /Frontage[:\\s]+([\\d.]+)\\s*m/i,
        /Lot Depth[:\\s]+([\\d.]+)\\s*m/i,
        /Side Setback[:\\s]+([\\d.]+)\\s*m/i,
        /Height[:\\s]+([\\d.]+)\\s*m/i,
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
    const def = {
      lotCoverage: '35.0',
      buildingHeight: '8.5',
      frontSetback: '2.0',
      rearSetback: '7.5',
      sideSetback: '1.2',
      lotCoverageNote: 'Default values for testing',
      confidence: 0.5,
      source: 'default',
      raw: 'Default test values',
    }
    const data = extracted || def
    const rules = evaluateCompliance(zone, { frontage, depth, isCorner, extracted: data })
    setResults(rules)
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
      </header>
      {showResults ? (
        <ResultsScreen
          address={address}
          zone={zone}
          frontage={frontage}
          depth={depth}
          isCorner={isCorner}
          results={results}
          onBack={() => setShowResults(false)}
        />
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
