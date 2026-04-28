import StatusBadge from './StatusBadge'

const s = {
  wrap: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' },
  panel: { background: '#111', border: '1px solid #333', borderRadius: '12px', padding: '24px' },
  h2: { fontSize: '16px', fontWeight: 'bold', marginBottom: '20px', color: '#FFF' },
  label: { fontSize: '12px', color: '#888', marginBottom: '6px' },
  input: { width: '100%', background: '#1A1A1A', border: '1px solid #333', borderRadius: '6px', padding: '10px 12px', color: '#EEE', fontSize: '14px', outline: 'none' },
  row: { display: 'flex', gap: '12px', marginBottom: '16px' },
  half: { flex: 1 },
  chk: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' },
  btn: { background: '#FF6B35', border: 'none', borderRadius: '6px', padding: '10px 20px', color: '#FFF', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' },
  drop: { border: '2px dashed #444', borderRadius: '8px', padding: '32px', textAlign: 'center', color: '#888', cursor: 'pointer' },
  meta: { background: '#1A1A1A', borderRadius: '6px', padding: '12px', marginTop: '12px', fontSize: '13px' },
  metaRow: { display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #333' },
  tier: { marginTop: '8px', fontSize: '12px' },
  info: { background: '#1A1A1A', border: '1px solid #333', borderRadius: '8px', padding: '12px', marginBottom: '16px', fontSize: '13px' },
}

export default function UploadScreen({ address, setAddress, zone, setZone, frontage, setFrontage, depth, setDepth, isCorner, setIsCorner, showManual, setShowManual, lookupLoading, lookupTier, lookupSource, file, setFile, extracted, setExtracted, loading, handleAddressBlur, handleFileSelect, handleGenerateReport }) {
  const handleFileDrop = (e) => {
    e.preventDefault()
    const f = e.dataTransfer?.files?.[0]
    if (f) { setFile(f); handleFileSelect({ target: { files: [f] } }) }
  }
  return (
    <div style={s.wrap}>
      <div style={s.panel}>
        <h2 style={s.h2}>Property</h2>
        <div style={{ marginBottom: '16px' }}>
          <div style={s.label}>Address</div>
          <input style={s.input} value={address} onChange={e => setAddress(e.target.value)} onBlur={handleAddressBlur} placeholder="Enter address..." disabled={lookupLoading} />
        </div>
        {lookupTier && (
          <div style={s.info}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span>Detected: {zone} ({lookupSource})</span>
              <StatusBadge tier={lookupTier} />
            </div>
            <div style={{ fontSize: '12px', color: '#888' }}>Confidence tier from lookup. Review lot details below.</div>
          </div>
        )}
        {(showManual || !zone) && (
          <div style={{ background: '#1A1A1A', border: '1px solid #333', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
            <div style={{ fontSize: '13px', color: '#AAA', marginBottom: '12px' }}>Lot Parameters</div>
            <div style={s.row}>
              <div style={s.half}>
                <div style={s.label}>Zone</div>
                <input style={s.input} value={zone} onChange={e => setZone(e.target.value)} placeholder="R1, R2, R3, RD, RM, MC" />
              </div>
              <div style={s.half}>
                <div style={s.label}>Corner Lot?</div>
                <select style={s.input} value={isCorner ? 'true' : 'false'} onChange={e => setIsCorner(e.target.value === 'true')}>
                  <option value="false">No</option><option value="true">Yes</option>
                </select>
              </div>
            </div>
            <div style={s.row}>
              <div style={s.half}>
                <div style={s.label}>Frontage (m)</div>
                <input style={s.input} type="number" step="0.01" value={frontage} onChange={e => setFrontage(e.target.value)} placeholder="0.00" />
              </div>
              <div style={s.half}>
                <div style={s.label}>Depth (m)</div>
                <input style={s.input} type="number" step="0.01" value={depth} onChange={e => setDepth(e.target.value)} placeholder="0.00" />
              </div>
            </div>
          </div>
        )}
        <div>
          <div style={s.label}>Upload Site Plan</div>
          <div style={s.drop} onDragOver={e => e.preventDefault()} onDrop={handleFileDrop}>
            <input type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={handleFileSelect} style={{ display: 'none' }} id="fileInput" />
            <label htmlFor="fileInput" style={{ cursor: 'pointer' }}>
              {file ? file.name : 'Drag & drop or click to upload'}
            </label>
          </div>
          {extracted && (
            <div style={s.meta}>
              <div style={s.metaRow}><span>Lot Coverage</span><span>{extracted.lotCoverage}%</span></div>
              <div style={s.metaRow}><span>Building Height</span><span>{extracted.buildingHeight} m</span></div>
              <div style={s.metaRow}><span>Front Setback</span><span>{extracted.frontSetback} m</span></div>
              <div style={s.metaRow}><span>Rear Setback</span><span>{extracted.rearSetback} m</span></div>
              <div style={s.metaRow}><span>Side Setback</span><span>{extracted.sideSetback} m</span></div>
              <div style={{ marginTop: '8px', color: '#888', fontSize: '11px' }}>{extracted.lotCoverageNote}</div>
              {extracted.raw && <div style={{ marginTop: '4px', color: '#666', fontSize: '11px' }}>{extracted.raw}</div>}
            </div>
          )}
        </div>
      </div>
      <div style={s.panel}>
        <h2 style={s.h2}>Compliance Check</h2>
        <div style={{ color: '#888', fontSize: '14px', marginBottom: '24px', lineHeight: '1.6' }}>
          <p style={{ marginBottom: '8px' }}>This tool checks dimensional zoning compliance against Toronto Zoning By-law 569-2013.</p>
          <p style={{ marginBottom: '8px' }}>Checks include: lot coverage, building height, and setbacks (front, rear, side).</p>
          <p style={{ marginBottom: '8px' }}>Supported zones: R1, R2, R3, RD, RM, MC.</p>
          <div style={{ marginTop: '16px', padding: '12px', background: '#1A1A1A', borderRadius: '6px', fontSize: '12px', color: '#AAA' }}>
            <strong style={{ color: '#FF6B35' }}>Note:</strong> This is a pre-flight screening tool only. Always consult with a professional for official permit submissions.
          </div>
        </div>
        <button style={{ ...s.btn, width: '100%' }} disabled={!zone || !extracted || loading} onClick={handleGenerateReport}>
          {loading ? 'Processing...' : 'Check Compliance'}
        </button>
      </div>
    </div>
  )
}
