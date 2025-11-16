# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]
**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

> Archidraw ships as a SvelteKit SPA backed by FastAPI services. Plans must keep MVC boundaries, tests, and stack tooling aligned with the constitution before implementation begins.

## Summary

[Extract from feature spec: primary requirement + technical approach from research]

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: Frontend TypeScript (SvelteKit SPA) | Backend Python 3.12+ (FastAPI)  
**Primary Dependencies**: Svelte stores, Fabric.js, FastAPI routers, Pydantic models, uv-managed packages  
**Storage**: [Document backing stores or `N/A`]  
**Testing**: Vitest + Playwright (frontend), Pytest + Behave (backend + BDD)  
**Target Platform**: Browser SPA + Linux-hosted FastAPI services  
**Project Type**: Web (monorepo with `frontend/` and `backend/`)  
**Performance Goals**: [Add concrete latency, FPS, throughput targets]  
**Constraints**: [List p95 latency, memory, security or compliance limits]  
**Scale/Scope**: [Quantify users, diagrams, concurrent sessions]

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [ ] Speckit spec + research/data-model/tasks are approved and linked in this plan (Principle I).
- [ ] Proposed solution maps every behavior to explicit MVC layers in `frontend/` or `backend/` without leaking business logic into views (Principle II).
- [ ] Test strategy lists failing-first Vitest/Pytest/Behave/Playwright coverage before implementation (Principle III).
- [ ] Tooling choices stay within SvelteKit + Fabric.js + FastAPI + uv ecosystem, with linting/formatting expectations noted (Principle IV).
- [ ] Directory and CI impact respect the monorepo baseline (`backend/app|features|tests`, `frontend/src/lib|routes|tests`, `.github/workflows`) and include documentation updates (Principle V).

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

**Structure Decision**: [Document how this feature reuses/extends the baseline paths above. New top-level directories are disallowed.]

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
