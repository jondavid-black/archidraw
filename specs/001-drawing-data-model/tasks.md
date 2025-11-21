# Tasks: Drawing Data Model & Persistence

**Feature Branch**: `001-drawing-data-model`
**Spec**: [spec.md](./spec.md)
**Plan**: [plan.md](./plan.md)

## Phase 1: Setup
*Project initialization and directory structure.*

- [ ] T001 Create feature directory structure in backend `backend/features/drawings/`
- [ ] T002 Create feature directory structure in frontend `frontend/src/lib/stores/` and `frontend/src/lib/components/drawing/`

## Phase 2: Foundational
*Blocking prerequisites for all user stories.*

- [ ] T003 Define Pydantic models (`DrawingItem`, `Line`, `Drawing`) in `backend/features/drawings/models.py`
- [ ] T004 Implement `DrawingService` with atomic file I/O logic in `backend/features/drawings/service.py`
- [ ] T005 Define shared TypeScript interfaces for Drawing/Line in `frontend/src/lib/types/drawing.ts`

## Phase 3: User Story 1 - View Available Drawings
*As a user, I want to see a list of available drawings so that I can choose one to work on.*

- [ ] T006 [US1] Create test for `GET /drawings` in `backend/tests/features/drawings/test_router.py`
- [ ] T007 [US1] Implement `GET /drawings` endpoint in `backend/features/drawings/router.py`
- [ ] T008 [US1] Register drawings router in `backend/app/main.py`
- [ ] T009 [US1] Create `drawingStore` with `drawings` list state in `frontend/src/lib/stores/drawingStore.ts`
- [ ] T010 [US1] Implement `fetchDrawings` action in `frontend/src/lib/stores/drawingStore.ts`
- [ ] T011 [US1] Create `DrawingList.svelte` component to display list in `frontend/src/lib/components/drawing/DrawingList.svelte`
- [ ] T012 [US1] Integrate `DrawingList` into `frontend/src/routes/+page.svelte`

## Phase 4: User Story 2 - Load and Render Drawing
*As a user, I want to load a specific drawing and see its contents rendered on the canvas.*

- [ ] T013 [US2] Create test for `GET /drawings/{name}` in `backend/tests/features/drawings/test_router.py`
- [ ] T014 [US2] Implement `GET /drawings/{name}` endpoint in `backend/features/drawings/router.py`
- [ ] T015 [US2] Update `drawingStore` to handle `currentDrawing` state in `frontend/src/lib/stores/drawingStore.ts`
- [ ] T016 [US2] Implement `loadDrawing` action in `frontend/src/lib/stores/drawingStore.ts`
- [ ] T017 [US2] Update `fabricSceneStore.ts` to render items from `drawingStore` in `frontend/src/lib/stores/fabricSceneStore.ts`
- [ ] T029 [US2] Implement infinite/responsive canvas resizing logic in `frontend/src/lib/components/canvas/FabricStage.svelte`
- [ ] T018 [US2] Add Playwright test for loading a drawing in `frontend/e2e/drawing-load.spec.ts`

## Phase 5: User Story 3 - Auto-Save Changes
*As a user, I want my changes to be saved automatically after I stop working for a moment.*

- [ ] T019 [US3] Create test for `PUT /drawings/{name}` in `backend/tests/features/drawings/test_router.py`
- [ ] T020 [US3] Implement `PUT /drawings/{name}` endpoint in `backend/features/drawings/router.py`
- [ ] T021 [US3] Implement debounce logic and `saveDrawing` action in `frontend/src/lib/stores/drawingStore.ts`
- [ ] T022 [US3] Subscribe `drawingStore` to `fabricSceneStore` changes to trigger auto-save in `frontend/src/routes/+page.svelte`

## Phase 6: User Story 4 - Create New Drawing
*As a user, I want to create a new blank drawing so that I can start a fresh design.*

- [ ] T023 [US4] Create test for `POST /drawings` in `backend/tests/features/drawings/test_router.py`
- [ ] T024 [US4] Implement `POST /drawings` endpoint in `backend/features/drawings/router.py`
- [ ] T025 [US4] Add "New Drawing" button and handler to `frontend/src/lib/components/drawing/DrawingList.svelte`
- [ ] T026 [US4] Implement `createDrawing` action in `frontend/src/lib/stores/drawingStore.ts`

## Final Phase: Polish & Cross-Cutting
*Ensure quality and documentation.*

- [ ] T027 Run full test suite (backend + frontend) and fix any regressions
- [ ] T028 Update documentation in `frontend/src/routes/docs/features/drawing-model.md`

## Dependencies
- US1 (View) -> US2 (Load) -> US3 (Auto-Save) -> US4 (Create)
- Backend models (T003) and Service (T004) are prerequisites for all backend endpoints.
- Frontend types (T005) are prerequisites for frontend stores.

## Implementation Strategy
1.  **MVP (US1 & US2)**: Focus on listing and loading existing files (manually seeded) to verify the data model and rendering pipeline.
2.  **Persistence (US3)**: Add the save capability to close the loop.
3.  **Creation (US4)**: Add the ability to create new files to complete the lifecycle.
