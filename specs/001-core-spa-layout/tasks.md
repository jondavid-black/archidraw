# Tasks: Fabric Canvas Baseline

**Input**: Design documents from `/specs/001-core-spa-layout/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are MANDATORY. For each story, Vitest/Playwright tasks precede implementation so we stay RED → GREEN → REFACTOR.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Task can run in parallel (different files, no dependency).
- **[Story]**: `[US1]`, `[US2]`, `[US3]` map directly to the spec’s user stories.
- Every task references explicit repo paths.

---

## Phase 1: Setup (Shared Infrastructure)

- [ ] T001 Add `fabric` and `@types/fabric` deps plus any script updates in `frontend/package.json` (commit lockfile).
- [ ] T002 [P] Update `frontend/eslint.config.js` + `frontend/tsconfig.json` to cover `src/lib/canvas`, `src/lib/stores`, and `src/lib/instrumentation` globs.
- [ ] T003 Refresh `frontend/README.md` dev instructions to match the Fabric SPA baseline (npm scripts, Playwright commands).

---

## Phase 2: Foundational (Blocking Prerequisites)

- [ ] T004 Create telemetry shim `frontend/src/lib/instrumentation/telemetry.ts` exposing `publishCanvasEvent` and a `window.__ARCHIDRAW_TELEMETRY__` hook for Playwright.
- [ ] T005 Implement `workspaceLayoutStore` in `frontend/src/lib/stores/workspaceLayoutStore.ts` (breakpoints, pixel ratio, throttled resize timestamps).
- [ ] T006 Implement `canvasStatusStore` in `frontend/src/lib/stores/canvasStatusStore.ts` with `idle→initializing→ready/error` transitions + retry action.
- [ ] T007 Implement `fabricSceneStore` in `frontend/src/lib/stores/fabricSceneStore.ts` to hold Fabric canvas refs, zoom, and pan.
- [ ] T008 [P] Export new stores/instrumentation via `frontend/src/lib/index.ts` and scaffold sanity Vitest coverage in `frontend/tests/setup/stores.spec.ts`.

**Checkpoint**: Stores + telemetry utilities exist; user stories can begin.

---

## Phase 3: User Story 1 — Launch full-screen Fabric workspace (Priority: P1) 🎯

**Goal**: Boot straight into a fullscreen Fabric canvas with a blocking readiness overlay and baseline telemetry logging.

**Independent Test**: Playwright smoke (`frontend/e2e/canvas-ready.spec.ts`) loads `/`, waits ≤1.5 s for overlay dismissal, and asserts `fabric-ready` telemetry.

### Tests (write first)

- [ ] T009 [P] [US1] Vitest `frontend/tests/canvas/fabricStage.spec.ts` to cover Fabric init/teardown + store wiring.
- [ ] T010 [P] [US1] Playwright `frontend/e2e/canvas-ready.spec.ts` verifying `<canvas>` render, readiness overlay dismissal, and that `fabric-initialized` occurs <1 s after `layout-mounted` via telemetry.
- [ ] T011 [P] [US1] Vitest `frontend/tests/components/CanvasStatus.spec.ts` covering loading→ready transitions and focus handling.
- [ ] T012 [P] [US1] Playwright `frontend/e2e/overlay-blocking.spec.ts` asserting overlay intercepts pointer/keyboard events until `canvasStatusStore` = ready.

### Implementation

- [ ] T013 [P] [US1] Build `frontend/src/lib/canvas/createFabricStage.ts` helper (dynamic import, pattern background factory, SSR guard).
- [ ] T014 [US1] Build `frontend/src/lib/components/canvas/FabricStage.svelte` using `onMount` to create Fabric, bind stores, and clean up on destroy.
- [ ] T015 [US1] Build `frontend/src/lib/components/overlay/CanvasStatus.svelte` that blocks input, shows loading text, and fades out ≤300 ms.
- [ ] T016 [US1] Wire overlay + Fabric component inside `frontend/src/routes/+page.svelte`, restoring focus to the canvas after overlay dismissal.
- [ ] T017 [US1] Populate `frontend/src/routes/+page.ts` with layout props (initial viewport, grid default) feeding the stores.
- [X] T018 [US1] Add 100% height layout styles in `frontend/src/routes/+layout.svelte` (or scoped style) removing scrollbars and ensuring canvas fills viewport.

**Checkpoint**: US1 red→green cycle complete; canvas + overlay + telemetry baseline work end-to-end.

---

## Phase 4: User Story 2 — Respond fluidly to viewport changes (Priority: P2)

**Goal**: Keep the canvas responsive (≥1280 px desktop, <1024 px laptop, <768 px mobile) and support the Fabric grid toggle.

**Independent Test**: Playwright resize suite runs 980 px + 720 px scenarios verifying no scrollbars and pinch-zoom messaging.

### Tests (write first)

- [ ] T019 [P] [US2] Expand `frontend/tests/stores/workspaceLayoutStore.spec.ts` (breakpoints, throttling, persistence flags).
- [ ] T020 [P] [US2] Playwright `frontend/e2e/canvas-resize.spec.ts` scripting the 1280 px → 1024 px → 980 px → 768 px loop five times, asserting at least 19/20 transitions stay scrollbar-free with visual diff baselines.
- [ ] T021 [P] [US2] Playwright `frontend/e2e/canvas-mobile.spec.ts` resizing to 720 px, validating no horizontal scroll, pinch-zoom cues, and reflow after toggling `document.visibilityState` to simulate device resume.

### Implementation

- [ ] T022 [US2] Wire `ResizeObserver` + `window`/`visibilitychange` listeners in `frontend/src/routes/+page.svelte` pushing updates into `workspaceLayoutStore` (debounced ≤5/sec) so resume-from-sleep immediately remeasures.
- [ ] T023 [US2] Enhance `frontend/src/lib/components/canvas/FabricStage.svelte` to call `canvas.setDimensions` + `setZoom` when layout store emits.
- [ ] T024 [US2] Create `frontend/src/lib/components/canvas/GridToggle.svelte` (keyboard accessible) controlling the store and Fabric pattern helper.
- [ ] T025 [US2] Extend `createFabricStage.ts` with a reusable `createGridPattern` util reused by toggle handler.
- [ ] T026 [US2] Persist layout + grid prefs via `sessionStorage` in `workspaceLayoutStore` with graceful SSR fallback.
- [ ] T027 [US2] Display pinch-zoom guidance banner (within overlay or dedicated component) when `breakpoint === 'mobile'`.

**Checkpoint**: Canvas resizes smoothly across breakpoints; tests and grid toggle pass.

---

## Phase 5: User Story 3 — Instrument readiness telemetry & recovery (Priority: P3)

**Goal**: Emit structured telemetry for ready/error events, ensure overlay shows diagnostic details, and enable retries without page reloads.

**Independent Test**: Playwright telemetry spec listens to `window.__ARCHIDRAW_TELEMETRY__`, forces failure, then validates retry + event payloads across Chromium and WebKit.

### Tests (write first)

- [ ] T028 [P] [US3] Vitest `frontend/tests/instrumentation/telemetry.spec.ts` covering `publishCanvasEvent`, event payload schema, timestamp deltas (1 s guard), and window hook.
- [x] T029 [P] [US3] Playwright `frontend/e2e/canvas-telemetry.spec.ts` (Chromium) validating ready/error events + retry.
- [x] T030 [P] [US3] Playwright `frontend/e2e/canvas-telemetry.spec.ts` (WebKit) to satisfy SC-003 multi-browser coverage.

### Implementation

- [ ] T031 [US3] Extend telemetry shim to buffer events, attach to `window.__ARCHIDRAW_TELEMETRY__`, and expose subscription API for Playwright.
- [ ] T032 [US3] Instrument `createFabricStage.ts` to emit `layout-mounted`, `fabric-initialized`, `fabric-ready`, and `fabric-error` with duration + viewport metadata.
- [ ] T033 [US3] Update `CanvasStatus.svelte` to show diagnostic text (durations, errors) and retry CTA tied to `canvasStatusStore.retry`.
- [ ] T034 [US3] Implement retry workflow in `canvasStatusStore` + `fabricSceneStore` (dispose canvas, recreate, reapply grid) ensuring overlay blocks input during retry.

**Checkpoint**: Telemetry + error recovery validated in Chromium/WebKit; SC-003 satisfied.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [ ] T035 Capture Playwright visual-diff baselines for `canvas-resize` + `canvas-mobile` suites (store artifacts under `frontend/e2e/__screenshots__/`).
- [ ] T036 [P] Update `frontend/playwright.config.ts` to enable Chromium + WebKit runs, screenshot comparisons, and per-suite thresholds that map to SC-002 metrics.
- [X] T037 [P] Update `.github/workflows/frontend.yml` (or equivalent) so CI runs `npm run lint`, `npm run test`, `npm run check`, and `npm run test:e2e` with the new suites/browsers.
- [ ] T038 Update docs `frontend/src/routes/docs/drawing-shell/+page.md` describing layout regions, grid toggle, telemetry overlay, and troubleshooting tips.
- [ ] T039 [P] Refresh `specs/001-core-spa-layout/quickstart.md` with final commands plus instructions for capturing telemetry logs.
- [ ] T040 Run `npm run lint`, `npm run test`, `npm run check`, and `npm run test:e2e` from `frontend/`, capturing output for PR notes.
- [ ] T042 Gather design sign-off for `frontend/src/routes/docs/drawing-shell/+page.md` plus overlay visuals, logging approvals in the PR description.
- [ ] T043 Update the onboarding checklist (referenced in `docs/`) to link the new documentation page and telemetry playbook, referencing commit SHA.
- [ ] T041 [P] Perform accessibility sweep (e.g., Playwright Axe) verifying overlay focus traps, keyboard navigation, and high-zoom behavior.

---

## Dependencies & Execution Order

- Phase order: Setup → Foundational → US1 → US2 → US3 → Polish.
- US1 must finish before US2/US3 to guarantee Fabric baseline; US2 + US3 can proceed in parallel once US1 is merged.
- Tests are authored and expected to fail before implementation tasks start for each story.

## Parallel Execution Examples

- **Foundational**: T005–T007 touch different stores and can execute concurrently after T004 lands.
- **US1**: T009 & T010 (tests) run in parallel; T013/T014 (helper + component) can be split once store contracts stabilize; T015 + T016 (overlay + integration) can proceed alongside T017.
- **US2**: T020 & T021 (Playwright suites) can be developed by different engineers; T022 (controller wiring) and T023 (Fabric updates) coordinate via store contracts.
- **US3**: T028–T030 (tests) in parallel; T031/T032 telemetry plumbing while T033/T034 enhance overlay UX.

## Implementation Strategy

1. **MVP**: Deliver US1 to unblock demos and verify Fabric integration.
2. **Responsiveness**: Add US2 once baseline is stable; confirm SC-002 visual metrics.
3. **Diagnostics**: Finish US3 to provide telemetry + retry, satisfying SC-003 + FR-005/FR-006 durability.
4. **Polish**: Lock docs, CI, and accessibility before requesting final review.
