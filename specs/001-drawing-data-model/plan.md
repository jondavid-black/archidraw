# Implementation Plan: Drawing Data Model & Persistence

**Branch**: `001-drawing-data-model` | **Date**: 2025-11-20 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-drawing-data-model/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

> Archidraw ships as a SvelteKit SPA backed by FastAPI services. Plans must keep MVC boundaries, tests, and stack tooling aligned with the constitution before implementation begins.

## Summary

Implement the core data model for drawings (lists of items, starting with Lines) and the persistence layer.
- **Backend**: FastAPI endpoints to list, create, get, and save drawings as JSON files. Pydantic models for validation.
- **Frontend**: Svelte stores to manage drawing state and Fabric.js integration for rendering. Auto-save logic.

## Technical Context

**Language/Version**: Frontend TypeScript (SvelteKit SPA) | Backend Python 3.12+ (FastAPI)
**Primary Dependencies**: Svelte stores, Fabric.js, FastAPI routers, Pydantic models, uv-managed packages
**Storage**: JSON files in `backend/data`
**Testing**: Vitest + Playwright (frontend), Pytest + Behave (backend + BDD)
**Target Platform**: Browser SPA + Linux-hosted FastAPI services
**Project Type**: Web (monorepo with `frontend/` and `backend/`)
**Performance Goals**: API response < 200ms, Auto-save debounce 2s
**Constraints**: No database (JSON files), No auth
**Scale/Scope**: Single user (MVP), local file storage

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] Speckit spec + research/data-model/tasks are approved and linked in this plan (Principle I).
- [x] Proposed solution maps every behavior to explicit MVC layers in `frontend/` or `backend/` without leaking business logic into views (Principle II).
- [x] Test strategy lists failing-first Vitest/Pytest/Behave/Playwright coverage before implementation (Principle III).
- [x] Tooling choices stay within SvelteKit + Fabric.js + FastAPI + uv ecosystem, with linting/formatting expectations noted (Principle IV).
- [x] Directory and CI impact respect the monorepo baseline (`backend/app|features|tests`, `frontend/src/lib|routes|tests`, `.github/workflows`) and include documentation updates (Principle V).

## Project Structure

### Documentation (this feature)

```text
specs/001-drawing-data-model/
├── plan.md              # This file
├── research.md          # Fabric.js JSON format, Atomic writes
├── data-model.md        # Drawing, DrawingItem, Line entities
├── quickstart.md        # Usage instructions
├── contracts/           # OpenAPI spec
└── tasks.md             # To be generated
```

### Source Code (repository root)

```text
backend/
├── app/
│   └── main.py          # Register new router
├── features/
│   └── drawings/        # New feature module
│       ├── __init__.py
│       ├── router.py    # API endpoints
│       ├── models.py    # Pydantic models
│       └── service.py   # File I/O logic
└── tests/
    └── features/
        └── drawings/    # Pytest suites

frontend/
├── src/lib/
│   ├── stores/
│   │   └── drawingStore.ts # New store
│   └── components/
│       └── DrawingList.svelte # New component
├── src/routes/
│   └── +page.svelte     # Update to use DrawingList
└── e2e/                 # Playwright tests
```

**Structure Decision**: Adheres to standard monorepo structure. New feature code isolated in `backend/features/drawings` and `frontend/src/lib/stores`.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | | |
