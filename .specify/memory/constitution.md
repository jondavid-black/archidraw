<!--
Sync Impact Report
Version change: 0.0.0 → 1.0.0
Modified principles:
- Placeholder → I. Specification-Led Delivery
- Placeholder → II. MVC Contracts Are Law
- Placeholder → III. Test-First & Behavior-Driven Quality
- Placeholder → IV. Stack Integrity & Tooling Discipline
- Placeholder → V. Monorepo Structure & CI Guardianship
Added sections:
- Technology & Stack Constraints
- Development Workflow & Quality Gates
Removed sections:
- None
Templates requiring updates:
- ✅ .specify/templates/plan-template.md
- ✅ .specify/templates/spec-template.md
- ✅ .specify/templates/tasks-template.md
- ⚠️ .specify/templates/commands (directory not present; add guidance once available)
Follow-up TODOs:
- None
-->

# Archidraw Constitution

## Core Principles

### I. Specification-Led Delivery
Every change starts with a Speckit feature spec that references the plan, research, data-model, and tasks for the work. No code reaches `main` until the spec, acceptance tests, and success criteria are approved. Commits and PRs must link to their governing spec IDs so QA and product can trace intent to implementation. Rationale: Specs first prevents thrash and keeps us aligned on measurable outcomes.

### II. MVC Contracts Are Law
Frontend Models live in Svelte stores and supporting TypeScript classes, Views are `.svelte` components, and Controllers are SvelteKit actions, event handlers, and server routes. Backend Models are Pydantic schemas plus service layers, Views are external clients, and Controllers are FastAPI path functions. Business logic never leaks into Views, and Controllers forward to Models without side-stepping validation. Rationale: Rigid separation keeps drawing behaviors predictable and testable.

### III. Test-First & Behavior-Driven Quality
TDD and BDD are mandatory: write Vitest/Pytest unit tests, Playwright/Behave scenarios, and contract tests before production code. Every test must fail first, then pass with the minimal implementation, then be refactored. Feature branches cannot merge without automated runs proving the Given/When/Then scenarios in the spec. Rationale: Fast feedback and reproducible behavior are the only way to protect complex drawing workflows.

### IV. Stack Integrity & Tooling Discipline
The frontend is a SvelteKit SPA written in TypeScript with Fabric.js for canvas interactions and scoped component styles. The backend is Python 3.12+ with FastAPI, Pydantic models, and feature routers located under `backend/`. All dependencies are managed with `uv` and recorded in `pyproject.toml`. Linting and formatting rely on eslint + prettier (frontend) and ruff (backend). Every exported function, class, and store carries JSDoc/docstrings. Rationale: A consistent toolchain keeps our UI and API layers compatible and secure.

### V. Monorepo Structure & CI Guardianship
The repository always contains `backend/` (with `app/`, `features/`, `tests/`), `frontend/` (with `src/lib/`, `src/routes/`, `e2e/`), and `.github/` workflows plus instructions. Features extend these folders rather than inventing new top-level roots. Documentation (including the SSG docs site) lives under `frontend/src/routes/docs`. GitHub Actions enforce lint, test, and security gates; PRs lacking green pipelines are blocked. Rationale: Predictable structure lets contributors and automation reason about the system without guesswork.

## Technology & Stack Constraints

- **Frontend**: SvelteKit SPA in `frontend/`, TypeScript-only, Fabric.js for drawing, scoped `<style>` blocks per component, shared logic under `src/lib`, routes under `src/routes`, unit tests via Vitest, E2E tests via Playwright.
- **Backend**: FastAPI on Python 3.12+, application code in `backend/app`, feature routers and services in `backend/features`, automated tests in `backend/tests`. Service layers isolate business logic from controllers.
- **Package Management**: `uv` handles environments, dependency adds (`uv add ...`), and command execution (`uv run ...`). No `pip`, `venv`, or ad-hoc installers.
- **Data & Contracts**: Pydantic models define request/response contracts, and Fabric.js-driven schemas define canvas data shared between client and server. Shared schemas live beside their owning feature with explicit version tags.
- **Observability & Security**: Structured logging (JSON for backend, console groups for frontend devtools) plus audit-friendly metrics are required. Every endpoint enforces validation and input sanitization before business logic.

## Development Workflow & Quality Gates

1. Draft or amend the Speckit spec (`/speckit.spec`) and secure approval before development.
2. Generate the implementation plan (`/speckit.plan`) capturing research, data models, and contracts; document constitution compliance in the "Constitution Check" gate.
3. Produce tasks via `/speckit.tasks`, grouped by user story so each slice can be implemented and tested independently.
4. Implement by following Red→Green→Refactor: write failing tests (Vitest, Pytest, Behave, Playwright) first, add the minimal code in the prescribed MVC layer, then refactor while keeping coverage.
5. Maintain directory discipline: frontend work touches only `frontend/src/...`, backend work stays inside `backend/...`, and shared assets are referenced explicitly—no hidden cross-links.
6. Update docs (`frontend/src/routes/docs`) and changelogs alongside code, ensuring CI (lint, tests, security scans) is green before requesting review.

## Governance

- This constitution supersedes conflicting guidance; deviations must be recorded in the feature plan's Complexity Tracking table and approved in writing.
- Amendments require a proposal referencing affected principles, an impact analysis on specs/plans/tasks, and sign-off from the tech lead and product counterpart. Approved amendments increment the version per semantic versioning rules (MAJOR for principle rewrites/removals, MINOR for new principles or sections, PATCH for clarifications).
- Ratified versions are immutable; new guidance appends with a higher semantic version and updates "Last Amended".
- Compliance reviews happen in every PR. Reviewers verify spec linkage, MVC adherence, directory usage, and automated test evidence before approving.
- A quarterly governance review revisits this document, CI health, and template accuracy to ensure ongoing alignment.

**Version**: 1.0.0 | **Ratified**: 2025-11-16 | **Last Amended**: 2025-11-16
