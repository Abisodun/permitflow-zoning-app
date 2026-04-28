import { DEMO_ADDRESSES } from './constants.js'

export async function lookupZoning(address) {
  try {
    const res = await fetch('/api/zoning/lookup?address=' + encodeURIComponent(address))
    if (!res.ok) throw new Error('API error')
    const data = await res.json()
    return data
  } catch (err) {
    const key = address.toLowerCase().trim()
    const demo = DEMO_ADDRESSES[key]
    if (demo) {
      return {
        ...demo,
        confidenceTier: 'medium',
        source: 'demo',
        confidence: 0.5,
      }
    }
    return null
  }
}

export async function logOverride(payload) {
  try {
    await fetch('/api/feedback/override', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  } catch (err) {
    console.warn('Override log failed:', err)
  }
}
