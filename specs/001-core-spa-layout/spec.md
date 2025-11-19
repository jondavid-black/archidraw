# Feature Specification: Fabric Canvas Baseline

**Feature Branch**: `001-core-spa-layout`  
**Created**: 2025-11-16  
**Status**: Draft  
**Input**: User description: "Create the core single page application in the frontend.  The existing code is the default sveltekit setup so update everything as needed.  The single page app should have a fabric.js background, a pallet area floating on the top, a left hand sidebar for selecting content (similar to folder and file structure), and a right hand sidebar for selected item property visibility and editing.  Don't try to create all the content and behavior, just the basic single page application layout and core components."

> Tie every requirement back to the approved Speckit plan. Specs must describe how the feature fits the SvelteKit (frontend) + FastAPI (backend) stack and which tests will fail first per the constitution.

## Clarifications

### Session 2025-11-17

- Q: Should the readiness overlay block canvas interaction until Fabric reports ready? → A: Yes, the overlay must fully block pointer/keyboard events until Fabric emits its ready signal, then fade out.

## User Scenarios & Testing *(mandatory)*

<!--
  IMPORTANT: User stories should be PRIORITIZED as user journeys ordered by importance.
  Each user story/journey must be INDEPENDENTLY TESTABLE - meaning if you implement just ONE of them,
  you should still have a viable MVP (Minimum Viable Product) that delivers value.
  
  Assign priorities (P1, P2, P3, etc.) to each story, where P1 is the most critical.
  Think of each story as a standalone slice of functionality that can be:
  - Developed independently
  - Tested independently
  - Deployed independently
  - Demonstrated to users independently
-->

### User Story 1 - Launch full-screen Fabric workspace (Priority: P1)

Designers load Archidraw and instantly land inside a distraction-free Fabric.js canvas that fills the viewport and is ready for input.

**Why this priority**: A working canvas is the foundational experience; without it no future layout elements can be validated.

**Independent Test**: Playwright smoke test (`frontend/e2e/canvas-ready.spec.ts`) loads `/`, waits for the Fabric canvas container to appear, and asserts Fabric initialized by checking for injected `<canvas>` elements plus the readiness overlay dismissal; the test fails if initialization stalls.

**Acceptance Scenarios**:

1. **Given** the application loads fresh, **When** the root route renders, **Then** Fabric.js initializes with a neutral background and fills the viewport.
2. **Given** a returning designer, **When** they refresh the page, **Then** the canvas instantiates within 1 second and displays the onboarding overlay until ready.

**MVC Notes**: `workspaceLayoutStore` (Model) tracks viewport metrics, `frontend/src/routes/+page.svelte` (View) binds the Fabric canvas component, and `frontend/src/routes/+page.ts` (Controller) hydrates initial layout props.

---

### User Story 2 - Respond fluidly to viewport changes (Priority: P2)

Designers resize their browser or rotate devices and expect the Fabric canvas to adapt without scrollbars or blank gaps.

**Why this priority**: Responsive behavior proves the layout can host future panels without regressions and ensures Fabric sizing math is correct.

**Independent Test**: Vitest store test simulates breakpoint changes on `workspaceLayoutStore`, ensuring emitted dimensions update the Fabric canvas component; fails if canvas dimensions are stale.

**Acceptance Scenarios**:

1. **Given** the app runs on a laptop, **When** the viewport width shrinks below 1024 px, **Then** the canvas gracefully scales and preserves aspect ratio without horizontal scrolling.
2. **Given** a device sleeps or the tab becomes hidden, **When** the session resumes (visibility/page show event), **Then** the layout store remeasures within 250 ms and Fabric reapplies the correct dimensions without stretching artifacts.

**MVC Notes**: `workspaceLayoutStore` (Model) emits breakpoints, `frontend/src/lib/components/canvas/FabricStage.svelte` (View) adjusts size bindings, and `frontend/src/routes/+page.svelte` (Controller) wires resize observers to the store.

---

### User Story 3 - Instrument readiness telemetry & recovery (Priority: P3)

Operators need diagnostic data (durations, errors) emitted when the overlay transitions between states, plus a retry experience whenever Fabric initialization fails.

**Why this priority**: CI and support tooling require structured readiness signals and a deterministic way to unblock stuck sessions without reloading the page.

**Independent Test**: Playwright telemetry scenario listens to `window.__ARCHIDRAW_TELEMETRY__`, triggers both ready and forced-error flows, and asserts events plus overlay messaging match expectations.

**Acceptance Scenarios**:

1. **Given** Fabric initialization begins, **When** the ready event fires, **Then** the overlay emits a telemetry payload (duration, viewport) and dismisses while keeping focus on the canvas.
2. **Given** Fabric throws an initialization error, **When** the user clicks "Retry", **Then** the overlay logs a `fabric-error` event, re-enters initializing state, and blocks input until Fabric restarts.

**MVC Notes**: `canvasStatusStore` (Model) publishes telemetry-friendly events, `frontend/src/lib/components/overlay/CanvasStatus.svelte` (View) displays diagnostics + retry controls, and telemetry helpers in `frontend/src/lib/instrumentation/telemetry.ts` (Controller/service) forward events for Playwright and future backend syncing.

### Edge Cases

- Workspace loads on a narrow (<768 px) viewport: canvas must remain accessible with pinch-zoom cues instead of scrollbars.
- Fabric script fails to load: display a centered recoverable error card offering a retry button.
- Device resumes from sleep: remeasure viewport and re-render Fabric to avoid stretched pixels.
- Accessibility zoom (200 %) applied: ensure the canvas container adds focus outlines for keyboard users.

### MVC & Stack Mapping *(mandatory)*

- **Frontend Models (Svelte stores / TypeScript classes)**: `workspaceLayoutStore` (viewport metrics), `canvasStatusStore` (init state), and `fabricSceneStore` (references to Fabric stage + objects) support the single-panel experience.
- **Frontend Controllers & Views**: `frontend/src/routes/+layout.svelte` keeps the SPA chrome minimal, `frontend/src/routes/+page.svelte` orchestrates Fabric lifecycle, and lightweight components (`lib/components/canvas/FabricStage.svelte`, `lib/components/overlay/CanvasStatus.svelte`) render the view.
- **Backend Models & Services**: No new backend models for this milestone; existing drawing session services continue returning stub data for future binding.
- **Backend Controllers (FastAPI routers)**: No new routes; `backend/app/main.py` health/root endpoints remain untouched but serve as integration targets for later palette/property persistence.
- **Shared Schemas / Contracts**: Define `FabricCanvasState v0` contract covering viewport size, zoom level, background style, and readiness timestamps shared between Svelte stores and future backend persistence.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Frontend MUST render a full-viewport Fabric canvas with minimal chrome, ensuring no additional panels appear until future milestones.
- **FR-002**: Fabric.js MUST initialize with a neutral background, optional grid overlay toggle, and emit lifecycle events wired to Svelte stores; telemetry MUST record `layout-mounted`, `fabric-initialized`, and `fabric-ready` timestamps so tests fail when initial paint exceeds 1 s on modern laptops.
- **FR-003**: Canvas sizing MUST follow responsive breakpoints emitted by `workspaceLayoutStore`, preserving aspect ratio and removing scrollbars below 1024 px widths.
- **FR-004**: Canvas readiness MUST surface through `canvasStatusStore` so the overlay component can indicate loading, ready, and error states with clear messaging.
- **FR-005**: System MUST log initialization milestones (layout mounted, Fabric ready, Fabric error) to the browser console and forward them to the existing telemetry hook to aid CI smoke-test debugging.
- **FR-006**: Readiness overlay MUST capture all pointer/keyboard events until `canvasStatusStore` reports `ready`, then fade out within 300 ms while restoring interaction focus to the Fabric canvas.
- **FR-007**: The application MUST listen for `visibilitychange`/`pageshow` events, remeasure the viewport via `workspaceLayoutStore`, and refresh Fabric dimensions within 250 ms so resume-from-sleep scenarios match live resize behavior.

### Assumptions

- No backend APIs need updating; this milestone is purely frontend.
- Fabric.js 6.x is acceptable and will be added to the frontend workspace.
- Anonymous sessions remain supported; authentication wrappers live higher in the app shell.

### Key Entities *(include if feature involves data)*

- **WorkspaceLayoutState**: Captures viewport dimensions, pixel ratios, and breakpoint flags so the single canvas can adapt fluidly.
- **FabricCanvasState**: Encapsulates Fabric initialization status, background styling, zoom/transform settings, and error info for telemetry.

### Tooling & Documentation Requirements *(mandatory)*

- **Lint/Format**: Update `frontend/eslint.config.js` component-glob entries so eslint + prettier cover the new canvas and overlay directories.
- **Package Management**: Add `fabric` (and `@types/fabric` if needed) via `npm install` within `frontend`; no backend dependency shifts.
- **Docs**: Author a concise page under `frontend/src/routes/docs/drawing-shell/+page.md` explaining the minimalist canvas shell, readiness overlay, and known limitations.
- **CI Considerations**: Ensure Vitest covers layout + status stores, extend Playwright smoke tests for initialization timing, and verify GitHub Actions workflows (`npm run lint`, `npm run test`, `npm run check`) include the new files.

## Success Criteria *(mandatory)*

<!--
  ACTION REQUIRED: Define measurable success criteria.
  These must be technology-agnostic and measurable.
-->

### Measurable Outcomes

- **SC-001**: Designers reach a ready-to-draw state (Fabric ready + overlay dismissed) in under 1.5 seconds on a mid-tier laptop with cached assets, measured with the telemetry shim (`fabric-ready` minus `layout-mounted`).
- **SC-002**: In scripted resize runs (1280 px → 1024 px → 980 px → 768 px repeated five times per browser), at least 19 of 20 transitions complete without scrollbars or blank regions, verified via Playwright visual comparisons and console assertions.
- **SC-003**: Vitest store tests and Playwright readiness checks remain green across Chrome + WebKit runners for two consecutive CI builds.
- **SC-004**: Documentation page for the canvas shell receives sign-off from design leads and is referenced in at least one onboarding checklist.
