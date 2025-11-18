# Implementation Plan: Fabric Canvas Baseline

**Branch**: `001-core-spa-layout` | **Date**: 2025-11-17 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-core-spa-layout/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

> Archidraw ships as a SvelteKit SPA backed by FastAPI services. Plans must keep MVC boundaries, tests, and stack tooling aligned with the constitution before implementation begins.

## Summary

Deliver a focused frontend milestone that boots directly into a full-viewport Fabric.js canvas with no sidebars, exposes a blocking readiness overlay, and instruments telemetry so Playwright can assert initialization timing. The implementation keeps all logic inside Svelte stores + SvelteKit controllers, introduces Fabric integration helpers under `frontend/src/lib/`, and seeds documentation/tests so future UI layers (palette, sidebars) can snap onto the same scaffolding.

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: Frontend TypeScript (SvelteKit SPA) + Backend Python 3.12+ (FastAPI)  
**Primary Dependencies**: Svelte stores, Fabric.js 6.x, Playwright/Vitest, FastAPI baseline services, uv-managed packages  
**Storage**: N/A for this milestone (canvas state remains in-memory; persistence deferred)  
**Testing**: Vitest for stores/components, Playwright for readiness + viewport smoke, Pytest/Behave untouched  
**Target Platform**: Browser SPA (Chromium/WebKit runners) backed by existing FastAPI health endpoints  
**Project Type**: Web (monorepo with `frontend/` and `backend/`)  
**Performance Goals**: Canvas ready + overlay dismissed ≤1.5 s on mid-tier laptop; overlay fade animation ≤300 ms; resize reflow <200 ms  
**Constraints**: Must block interactions until Fabric ready; SSR disabled for Fabric component to avoid window access errors; maintain eslint/prettier + Vitest coverage  
**Scale/Scope**: Initial single-user sessions, up to 3 simultaneous open documents per browser tab

**Resolved Decisions (Phase 0 Research)**

1. **Grid Overlay Implementation**: Use a Fabric `Pattern` background built from a 32px offscreen canvas so the grid stays in sync with Fabric transforms (Research Decision 1).
2. **Telemetry Hook Target**: Publish readiness events through a new `$lib/instrumentation/telemetry.ts` shim that currently logs to `console.info` but centralizes future routing (Research Decision 2).
3. **Fabric + Svelte Lifecycle**: Initialize Fabric inside a dedicated `FabricStage.svelte` component leveraging `onMount`/`onDestroy` and export canvas refs via stores (Research Decision 3).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] Speckit spec + research/data-model/tasks are approved and linked in this plan (Principle I).  
  *Status*: Spec plus new `research.md`, `data-model.md`, and `quickstart.md` are now present; `tasks.md` will be produced during `/speckit.tasks` as usual.
- [x] Proposed solution maps every behavior to explicit MVC layers in `frontend/` with Fabric confined to Svelte stores/components; no backend changes (Principle II).
- [x] Test strategy will rely on Vitest (stores + overlay component) and Playwright (readiness + resize) with failing-first commitments prior to implementation (Principle III).
- [x] Tooling stays within SvelteKit + Fabric + eslint/prettier + uv-managed npm scripts; no new stacks (Principle IV).
- [x] Directory + CI impact remains inside `frontend/src/lib`, `frontend/src/routes`, `frontend/e2e`, and docs under `frontend/src/routes/docs`; CI jobs already cover `npm run lint|test|check` (Principle V).

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
backend/
├── app/          # FastAPI application wiring
├── features/     # Routers, services, Pydantic models per feature
└── tests/        # Pytest + Behave suites

frontend/
├── src/lib/      # Stores, shared utilities, Fabric.js helpers
├── src/routes/   # SvelteKit routes (+page.* components/controllers)
└── e2e/        # Vitest specs + Playwright suites

.github/
└── workflows/    # CI enforcing lint, tests, and security gates

frontend/src/routes/docs/  # SSG documentation updates tied to the feature
```

**Structure Decision**: Work is limited to `frontend/src/lib` (new `canvas`, `stores`, `instrumentation` directories), `frontend/src/routes/+page.svelte` (controller), `frontend/e2e` (Playwright smoke), and `frontend/src/routes/docs/drawing-shell` for documentation. No backend folders or new top-level directories are introduced.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |

## Phase 0 — Research Summary

See `research.md` for full notes. Key takeaways:

- Fabric grid overlay will use a lightweight pattern background so exports stay accurate.
- Telemetry funnels through a new `$lib/instrumentation/telemetry.ts` shim, enabling Playwright hooks without backend calls.
- Fabric initialization lives inside `FabricStage.svelte` with lifecycle-safe store wiring, preventing SSR issues.

## Phase 1 — Design & Contracts

- `data-model.md` captures `WorkspaceLayoutState`, `FabricCanvasState`, and `CanvasTelemetryEvent` schemas plus transitions and validations.
- `contracts/fabric-canvas-state.openapi.yaml` locks the JSON schema for future backend synchronization and telemetry consumers.
- `quickstart.md` documents install/run/test steps plus troubleshooting, ensuring onboarding stays spec-driven.

## Next Steps

- Use `/speckit.tasks` to break the work into developer-sized tasks aligned with the three user stories.
- During implementation, keep all Fabric interactions isolated within the new stores/components to preserve MVC contracts.
