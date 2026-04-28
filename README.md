# PermitFlow Zoning Pre-Flight

Toronto dimensional zoning compliance checker for By-law 569-2013.

## What It Does

- Enter a Toronto property address
- Auto-detects zoning, frontage, depth, and corner-lot status via GIS lookup
- Upload a site plan (PDF/image) and extract building dimensions
- Checks compliance: lot coverage, building height, front/rear/side setbacks
- Exports an HTML compliance report

## Supported Zones

| Zone | Description | Coverage | Height |
|------|-------------|----------|--------|
| R1 / RD | Residential Detached | 33% | 10m |
| R2 | Residential Detached (Medium) | 40% | 12m |
| R3 | Residential Detached (High) | 50% | 14m |
| RM | Residential Multiple | 60% | 18m |
| MC | Mixed Commercial | 60% | 22m |

## How GIS Lookup Works

1. Address is geocoded via Natural Resources Canada
2. Coordinates query Toronto's ArcGIS Zoning layer
3. Property Boundary layer provides parcel geometry
4. Frontage/depth estimated from parcel edges
5. Confidence tier (high/medium/low) shown in UI

## Running Locally

```bash
npm install
npm run dev
```

## Deploying to Vercel

```bash
npm install -g vercel
vercel
```

The `api/` folder contains serverless functions for zoning lookup.

## Disclaimer

This is a pre-flight screening tool only. Always consult a professional for official permit submissions.
