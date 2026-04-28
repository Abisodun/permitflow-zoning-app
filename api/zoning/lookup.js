import { DEMO_ADDRESSES, ZONE_RULES } from '../../src/lib/constants.js'

const GEOCODE_URL = 'https://geogratis.gc.ca/services/geolocation/en/locate'
const TORONTO_ZONING_URL = 'https://maps.toronto.ca/arcgis/rest/services/Zoning/Zoning/MapServer/0/query'
const TORONTO_PARCEL_URL = 'https://maps.toronto.ca/arcgis/rest/services/PropertyBoundary/PropertyBoundary/MapServer/0/query'
const TORONTO_CENTRELINE_URL = 'https://maps.toronto.ca/arcgis/rest/services/Centreline/Centreline/MapServer/0/query'

function calcConfidenceTier(conf) {
  if (conf >= 0.75) return 'high'
  if (conf >= 0.5) return 'medium'
  return 'low'
}

function normalizeZone(raw) {
  if (!raw) return null
  const z = String(raw).toUpperCase().trim()
  const map = { 'R1': 'R1', 'R2': 'R2', 'R3': 'R3', 'RD': 'R1', 'RM': 'RM', 'MC': 'MC' }
  return map[z] || null
}

function estimateMetrics(zone, geom) {
  const rule = ZONE_RULES[zone]
  const baseF = rule ? 12 : 12
  const baseD = rule ? 30 : 30
  let frontage = baseF, depth = baseD
  if (geom && geom.rings && geom.rings[0]) {
    const pts = geom.rings[0]
    let maxSeg = 0, secondMax = 0
    for (let i = 0; i < pts.length - 1; i++) {
      const dx = pts[i+1][0] - pts[i][0], dy = pts[i+1][1] - pts[i][1]
      const len = Math.sqrt(dx*dx + dy*dy)
      if (len > maxSeg) { secondMax = maxSeg; maxSeg = len }
      else if (len > secondMax) { secondMax = len }
    }
    frontage = Math.round(maxSeg * 100) / 100
    depth = Math.round(secondMax * 100) / 100
  }
  return { frontage, depth }
}

async function geocode(addr) {
  const q = encodeURIComponent(addr + ', Toronto, ON')
  const res = await fetch(GEOCODE_URL + '?q=' + q + '&output=json')
  if (!res.ok) throw new Error('Geocode failed')
  const data = await res.json()
  if (!data.results || !data.results[0]) throw new Error('No geocode result')
  const r = data.results[0]
  return { lat: r.geometry.y, lon: r.geometry.x, score: r.score || 0.5 }
}

async function queryZoning(lon, lat) {
  const where = '1=1'
  const geom = encodeURIComponent(JSON.stringify({ x: lon, y: lat, spatialReference: { wkid: 4326 } }))
  const params = 'where=' + where + '&geometry=' + geom + '&geometryType=esriGeometryPoint&inSR=4326&outFields=*&f=json'
  const res = await fetch(TORONTO_ZONING_URL + '?' + params)
  if (!res.ok) throw new Error('Zoning query failed')
  const data = await res.json()
  if (!data.features || data.features.length === 0) return null
  return data.features[0].attributes
}

async function queryParcel(lon, lat) {
  const geom = encodeURIComponent(JSON.stringify({ x: lon, y: lat, spatialReference: { wkid: 4326 } }))
  const params = 'where=1=1&geometry=' + geom + '&geometryType=esriGeometryPoint&inSR=4326&outFields=*&f=json&returnGeometry=true'
  const res = await fetch(TORONTO_PARCEL_URL + '?' + params)
  if (!res.ok) return null
  const data = await res.json()
  if (!data.features || data.features.length === 0) return null
  return data.features[0]
}

export async function GET(req) {
  try {
    const url = new URL(req.url)
    const address = url.searchParams.get('address')
    if (!address) return new Response(JSON.stringify({ error: 'Address required' }), { status: 400 })
    const key = address.toLowerCase().trim()
    if (DEMO_ADDRESSES[key]) {
      const d = DEMO_ADDRESSES[key]
      return new Response(JSON.stringify({ ...d, confidenceTier: 'medium', metricMethod: 'demo' }), { headers: { 'Content-Type': 'application/json' } })
    }
    const { lat, lon, score } = await geocode(address)
    const zoningAttrs = await queryZoning(lon, lat)
    if (!zoningAttrs) {
      return new Response(JSON.stringify({ error: 'No zoning found', source: 'api', confidenceTier: 'low', metricMethod: 'geocode-only' }), { status: 404, headers: { 'Content-Type': 'application/json' } })
    }
    const rawZone = zoningAttrs.ZONE || zoningAttrs.Zoning || zoningAttrs.zone || ''
    const zone = normalizeZone(rawZone)
    const parcel = await queryParcel(lon, lat)
    let frontage = 12, depth = 30, isCorner = false, metricMethod = 'zone-default'
    if (parcel && parcel.geometry) {
      const m = estimateMetrics(zone, parcel.geometry)
      frontage = m.frontage
      depth = m.depth
      metricMethod = 'parcel-boundary'
    }
    const conf = Math.min(score, 0.9)
    return new Response(JSON.stringify({ zone, frontage, depth, isCorner, source: 'api', confidence: conf, confidenceTier: calcConfidenceTier(conf), metricMethod, note: 'Parcel metrics estimated. Not survey-grade.' }), { headers: { 'Content-Type': 'application/json' } })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message, source: 'api' }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
}
