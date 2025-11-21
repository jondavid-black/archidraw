# archidraw Development Guidelines

Auto-generated from all feature plans. Last updated: 2025-11-17

## Active Technologies
- Frontend TypeScript (SvelteKit SPA) | Backend Python 3.12+ (FastAPI) + Svelte stores, Fabric.js, FastAPI routers, Pydantic models, uv-managed packages (001-drawing-data-model)

- Frontend TypeScript (SvelteKit SPA)
- Backend Python 3.12+ (FastAPI)
- Fabric.js 6.x + Svelte stores for canvas models
- Testing stack: Vitest + Playwright (frontend), Pytest + Behave (backend)
- Tooling: uv, eslint, prettier, ruff

## Project Structure

```text
backend/
├── app/
├── features/
└── tests/

frontend/
├── src/lib/
├── src/routes/
└── e2e/

.github/workflows/
specs/[feature]/
```

## Commands

```bash
# Frontend (when touched)
cd frontend
npm run lint
npm run test
npm run check
npm run build

# Backend (when touched)
cd backend
uv run pytest
uv run ruff check
uv run ruff format
```

## Code Style

Frontend TypeScript (SvelteKit SPA) + Backend Python 3.12+ (FastAPI): Follow standard conventions

## Recent Changes
- 001-drawing-data-model: Added Frontend TypeScript (SvelteKit SPA) | Backend Python 3.12+ (FastAPI) + Svelte stores, Fabric.js, FastAPI routers, Pydantic models, uv-managed packages

- 001-core-spa-layout: Added Frontend TypeScript (SvelteKit SPA) + Backend Python 3.12+ (FastAPI) + Svelte stores, Fabric.js 6.x, Playwright/Vitest, FastAPI baseline services, uv-managed packages

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
