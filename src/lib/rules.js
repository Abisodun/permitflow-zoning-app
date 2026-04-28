import { ZONE_RULES } from './constants.js'

function normalizeZone(zone) {
  if (!zone) return null
  const z = zone.toUpperCase().trim()
  if (['R1', 'RD'].includes(z)) return 'R1'
  if (['R2'].includes(z)) return 'R2'
  if (['R3'].includes(z)) return 'R3'
  if (['RM'].includes(z)) return 'RM'
  if (['MC'].includes(z)) return 'MC'
  return null
}

function getSetback(zone, type, isCorner, depth) {
  const rule = ZONE_RULES[zone]
  if (!rule) return { min: 0, max: 0 }
  const base = rule[type + 'Setback'] || 0
  const cornerMult = isCorner ? 0.75 : 1
  const depthAdj = depth && depth > 30 ? base * 0.9 : base
  const min = Math.round(base * cornerMult * 0.9 * 10) / 10
  const max = Math.round(base * cornerMult * 1.1 * 10) / 10
  return { min, max }
}

export function evaluateCompliance(zone, params) {
  const normZone = normalizeZone(zone)
  const results = []
  const { frontage, depth, isCorner, extracted } = params || {}
  if (!normZone || !extracted) return [{ rule: 'Missing zone or data', status: 'missing' }]
  const rule = ZONE_RULES[normZone]
  const lotArea = parseFloat(frontage || 0) * parseFloat(depth || 0)
  const coveragePct = parseFloat(extracted.lotCoverage || 0)
  if (coveragePct > 0) {
    results.push({
      rule: 'Lot Coverage',
      status: coveragePct <= rule.lotCoverage * 100 ? 'pass' : 'fail',
      actual: coveragePct.toFixed(1) + '%',
      required: (rule.lotCoverage * 100).toFixed(0) + '% max',
    })
  } else {
    results.push({ rule: 'Lot Coverage', status: 'missing' })
  }
  const height = parseFloat(extracted.buildingHeight || 0)
  if (height > 0) {
    results.push({
      rule: 'Building Height',
      status: height <= rule.buildingHeight ? 'pass' : 'fail',
      actual: height.toFixed(1) + 'm',
      required: rule.buildingHeight.toFixed(1) + 'm max',
    })
  } else {
    results.push({ rule: 'Building Height', status: 'missing' })
  }
  const fs = parseFloat(extracted.frontSetback || 0)
  if (fs > 0) {
    const sb = getSetback(normZone, 'front', isCorner, depth)
    results.push({
      rule: 'Front Setback',
      status: fs >= sb.min ? 'pass' : 'fail',
      actual: fs.toFixed(1) + 'm',
      required: sb.min.toFixed(1) + 'm min',
    })
  } else {
    results.push({ rule: 'Front Setback', status: 'missing' })
  }
  const rs = parseFloat(extracted.rearSetback || 0)
  if (rs > 0) {
    const sb = getSetback(normZone, 'rear', isCorner, depth)
    results.push({
      rule: 'Rear Setback',
      status: rs >= sb.min ? 'pass' : 'fail',
      actual: rs.toFixed(1) + 'm',
      required: sb.min.toFixed(1) + 'm min',
    })
  } else {
    results.push({ rule: 'Rear Setback', status: 'missing' })
  }
  const ss = parseFloat(extracted.sideSetback || 0)
  if (ss > 0) {
    const sb = getSetback(normZone, 'side', isCorner, depth)
    results.push({
      rule: 'Side Setback',
      status: ss >= sb.min ? 'pass' : 'fail',
      actual: ss.toFixed(1) + 'm',
      required: sb.min.toFixed(1) + 'm min',
    })
  } else {
    results.push({ rule: 'Side Setback', status: 'missing' })
  }
  return results
}
