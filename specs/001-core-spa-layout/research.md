# Research Findings — Fabric Canvas Baseline

## Decision 1: Fabric grid overlay implementation
- **Decision**: Render the optional grid by assigning a `fabric.Pattern` built from a 32px offscreen canvas as the Fabric canvas `backgroundColor` (pattern) instead of drawing DOM overlays.
- **Rationale**: Pattern backgrounds are GPU friendly, scroll/zoom with the Fabric viewport automatically, and can be toggled by swapping the background between solid color and pattern without re-rendering objects. This also keeps the grid within Fabric's rendering pipeline so exports capture it.
- **Alternatives Considered**:
  1. **CSS repeating-linear-gradient** – Simple to apply but would desync from Fabric transforms (zoom/pan) and break export parity.
  2. **Manual Fabric line objects** – Precise but adds hundreds of objects, hurting performance and complicating hit testing.

## Decision 2: Telemetry hook target for readiness events
- **Decision**: Introduce a lightweight `$lib/instrumentation/telemetry.ts` module that forwards structured events to `console.info` during this milestone and exposes a stub `publish(event)` function for future wiring.
- **Rationale**: Keeps instrumentation centralized, allows Playwright to hook into `window.__ARCHIDRAW_TELEMETRY__`, and avoids prematurely coupling to backend logging while still satisfying FR-005.
- **Alternatives Considered**:
  1. **Direct `console.log` inside components** – Fast but scatters telemetry and complicates future upgrades.
  2. **Immediate backend POST** – Overkill for a frontend-only milestone and would add latency plus error handling work we do not need yet.

## Decision 3: Fabric + Svelte lifecycle integration pattern
- **Decision**: Encapsulate Fabric initialization inside a dedicated `FabricStage.svelte` component that calls `onMount`, dynamically imports `fabric`, and stores the canvas instance in a Svelte store to keep MVC boundaries intact.
- **Rationale**: Avoids SSR pitfalls (Fabric accesses `window`), centralizes teardown via `onDestroy`, and ensures other components observe canvas state through stores rather than direct refs.
- **Alternatives Considered**:
  1. **Initialize Fabric in `+page.svelte` script** – Works but blurs controller vs. view responsibilities and complicates testing.
  2. **Use a vanilla `<canvas>` with manual drawing** – Would skip Fabric abstractions and diverge from long-term roadmap requiring Fabric features (objects, selection events).
