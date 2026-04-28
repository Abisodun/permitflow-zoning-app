export const ZONE_RULES = {
  R1: { lotCoverage: 0.33, buildingHeight: 10.0, frontSetback: 7.5, rearSetback: 7.5, sideSetback: 1.2 },
  R2: { lotCoverage: 0.40, buildingHeight: 12.0, frontSetback: 6.0, rearSetback: 7.5, sideSetback: 1.2 },
  R3: { lotCoverage: 0.50, buildingHeight: 14.0, frontSetback: 4.5, rearSetback: 6.0, sideSetback: 1.2 },
  RD: { lotCoverage: 0.33, buildingHeight: 10.0, frontSetback: 7.5, rearSetback: 7.5, sideSetback: 1.2 },
  RM: { lotCoverage: 0.60, buildingHeight: 18.0, frontSetback: 3.0, rearSetback: 6.0, sideSetback: 3.0 },
  MC: { lotCoverage: 0.60, buildingHeight: 22.0, frontSetback: 3.0, rearSetback: 6.0, sideSetback: 3.0 },
}

export const ZONE_DESCRIPTIONS = {
  R1: 'Residential Detached (Low Density)',
  R2: 'Residential Detached (Medium Density)',
  R3: 'Residential Detached (High Density)',
  RD: 'Residential Detached',
  RM: 'Residential Multiple',
  MC: 'Mixed Commercial',
}

export const DEMO_ADDRESSES = {
  '123 withrow ave': { zone: 'R1', frontage: 9.14, depth: 30.48, isCorner: false, source: 'demo', confidence: 0.5 },
  '456 galley ave': { zone: 'R2', frontage: 12.19, depth: 36.58, isCorner: false, source: 'demo', confidence: 0.5 },
  '789 pape ave': { zone: 'R3', frontage: 15.24, depth: 42.67, isCorner: true, source: 'demo', confidence: 0.5 },
  '101 danforth ave': { zone: 'RM', frontage: 18.29, depth: 48.77, isCorner: false, source: 'demo', confidence: 0.5 },
  '202 queen st e': { zone: 'MC', frontage: 21.34, depth: 54.86, isCorner: true, source: 'demo', confidence: 0.5 },
}
