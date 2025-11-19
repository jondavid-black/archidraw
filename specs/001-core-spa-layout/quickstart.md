# Quickstart — Fabric Canvas Baseline

## Prerequisites
- Node.js 20+ with npm installed (frontend only for this milestone)
- `uv` already installed for backend tooling (not touched here but required by repo standards)

## Install Frontend Dependencies
```bash
cd frontend
npm install
```

## Run the Dev Server
```bash
cd frontend
npm run dev -- --open
```
- The home route should display the fullscreen Fabric canvas with a blocking overlay while it initializes.
- Toggle the "Show grid" control (temporary toolbar) to verify the Fabric pattern background.

## Execute Tests
```bash
cd frontend
npm run test          # Vitest stores + components
npm run test:e2e      # Playwright readiness + resize smoke
npm run lint          # ESLint + Prettier checks
```

## Troubleshooting
- If the overlay never dismisses, open DevTools and confirm telemetry entries (`fabric-ready`) are emitted; missing entries usually indicate Fabric failed to instantiate.
- For SSR warnings about `window`, ensure the Fabric component is dynamically imported or wrapped with `onMount` as described in `data-model.md`.

## Documentation Preview
```bash
cd frontend
npm run docs
```
- Navigate to `/docs/drawing-shell` to review the updated walkthrough describing the canvas shell and readiness overlay.
