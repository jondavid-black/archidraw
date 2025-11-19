# Archidraw Frontend

This package hosts the Fabric canvas baseline described in `specs/001-core-spa-layout/`. Everything lives inside SvelteKit so the workspace boots straight into a fullscreen Fabric scene with an instrumentation overlay.

## Install & Run

```bash
npm install
npm run dev -- --open
```

- The home route `/` launches the Fabric canvas with the readiness overlay blocking input until telemetry reports `fabric-ready`.
- Use the grid toggle in the header to switch between solid background and the Fabric pattern grid.

## Quality Gates

```bash
npm run lint           # prettier + eslint across src/lib and routes
npm run test           # Vitest suites for stores, telemetry, and Fabric helpers
npm run test:e2e       # Playwright smoke, resize, telemetry, and accessibility checks
```

All GitHub Actions jobs run the commands above plus `npm run check` (svelte-check) so keep them green before sending a PR.

## Telemetry Debugging Tips

- Telemetry events emit through `window.__ARCHIDRAW_TELEMETRY__`. In DevTools, call `window.__ARCHIDRAW_TELEMETRY__.buffer` to inspect timestamps.
- `fabric-initialized` must occur <1 s after `layout-mounted`; failures will surface in Playwright and the Vitest instrumentation suite.
- If the overlay never dismisses, look for `fabric-error` telemetry and use the retry CTA embedded in the overlay panel.
