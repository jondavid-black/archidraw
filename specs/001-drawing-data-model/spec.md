# Feature Specification: Drawing Data Model & Persistence

**Feature Branch**: `001-drawing-data-model`
**Created**: 2025-11-20
**Status**: Draft
**Input**: User description: "Let's create the data model definitions.  The data model will consist of each item in a drawing, stored in a list, that can be rendered on the canvas.  The data model should retrieved from the backend based on the drawing name (i.e. file name).  Once retrieved, each entry in the list should be drawn in order with the first entry being in the back and each subsiquent item on front of the prior item on the canvas.  If a user changes an item interactively on the canvas, the change will be sent to the backend and saved after 2 sec of no change by the user. The initial item type will be a line.  The line will is defined by the 2 points on the canvas for each endopint of the line.  Style metadata such as line color, line weight, and line style will also be included in the line definition.  Use Pydantic in the backend to define the line data type and support persistence.  Create a backend RESTful API that retrieves available drawing names (i.e. file names).  Create a backend RESTful API that retrieves the drawing content items when provided a drawing name.  When data items are retrieved, render them on the canvas."

> Tie every requirement back to the approved Speckit plan. Specs must describe how the feature fits the SvelteKit (frontend) + FastAPI (backend) stack and which tests will fail first per the constitution.

## Clarifications

### Session 2025-11-20

- Q: How should users create new drawings? → A: In Scope: Add `POST /api/drawings` and a "New Drawing" UI button.
- Q: How should the system handle duplicate drawing names during creation? → A: Return Error (409 Conflict). User must choose a different name.
- Q: What coordinate system should be used for drawing items? → A: Screen Pixels: 1 unit = 1 pixel. Origin (0,0) at top-left.
- Q: What are the canvas dimensions? → A: Infinite/Responsive: Canvas has no fixed boundaries; it expands to fit the viewport or content.
- Q: What storage format should be used for drawings? → A: JSON: Standard, human-readable, easy to debug.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Available Drawings (Priority: P1)

As a user, I want to see a list of available drawings so that I can choose one to work on.

**Why this priority**: Fundamental for accessing content.

**Independent Test**:
- **Backend**: Pytest for `GET /api/drawings` returning a list of strings.
- **Frontend**: Vitest for a component that fetches and displays the list.

**Acceptance Scenarios**:

1. **Given** the backend has drawings "plan.json" and "sketch.json", **When** the user requests the drawing list, **Then** the system displays "plan.json" and "sketch.json".
2. **Given** no drawings exist, **When** the user requests the list, **Then** the system displays an empty list or appropriate message.

**MVC Notes**:
- **Backend**: `DrawingService` (Service), `GET /drawings` (Controller).
- **Frontend**: `drawingStore` (Model), `DrawingList.svelte` (View).

---

### User Story 2 - Load and Render Drawing (Priority: P1)

As a user, I want to load a specific drawing and see its contents rendered on the canvas so that I can view or edit it.

**Why this priority**: Core functionality of a drawing app.

**Independent Test**:
- **Backend**: Pytest for `GET /api/drawings/{name}` returning JSON list of items.
- **Frontend**: Playwright test verifying canvas contains objects matching the response.

**Acceptance Scenarios**:

1. **Given** a drawing "demo" exists with one red line, **When** the user loads "demo", **Then** a red line is rendered on the canvas.
2. **Given** a drawing has multiple items, **When** loaded, **Then** items are rendered in list order (first item at the back).

**MVC Notes**:
- **Backend**: `Drawing` Pydantic model (Model), `GET /drawings/{name}` (Controller).
- **Frontend**: `fabricSceneStore` (Model), `FabricStage.svelte` (View).

---

### User Story 3 - Auto-Save Changes (Priority: P1)

As a user, I want my changes to be saved automatically after I stop working for a moment, so that I don't lose my work.

**Why this priority**: Data persistence and user convenience.

**Independent Test**:
- **Frontend**: Vitest for `drawingStore` debounce logic (ensure save called 2s after last change).
- **Backend**: Pytest for `PUT /api/drawings/{name}` updating the file.

**Acceptance Scenarios**:

1. **Given** a loaded drawing, **When** the user adds a line and waits 2 seconds, **Then** the current drawing state is sent to the backend.
2. **Given** the user is continuously drawing, **When** less than 2 seconds have passed since the last change, **Then** no save request is sent.

**MVC Notes**:
- **Backend**: `PUT /drawings/{name}` (Controller).
- **Frontend**: `drawingStore` (Model) with debounce logic.

---

### User Story 4 - Create New Drawing (Priority: P2)

As a user, I want to create a new blank drawing so that I can start a fresh design.

**Why this priority**: Necessary for creating content, though users could start with pre-seeded files in MVP.

**Independent Test**:
- **Backend**: Pytest for `POST /api/drawings` creating a new file.
- **Frontend**: Playwright test clicking "New Drawing", entering a name, and verifying the canvas is blank and ready.

**Acceptance Scenarios**:

1. **Given** the user is on the drawing list, **When** they click "New Drawing" and enter "project-x", **Then** a new empty drawing is created and opened.
2. **Given** a valid name, **When** the drawing is created, **Then** it appears in the list of available drawings.
3. **Given** a drawing "existing-plan" already exists, **When** the user tries to create a new drawing named "existing-plan", **Then** the system shows an error message "Drawing already exists".

**MVC Notes**:
- **Backend**: `POST /drawings` (Controller).
- **Frontend**: `DrawingList.svelte` (View), `drawingStore` (Model).

### Edge Cases

- **Network Failure**: What happens if auto-save fails? (Assumption: Retry or show error toast).
- **Concurrent Edits**: Last write wins (simple overwrite for MVP).
- **Invalid Data**: Backend rejects malformed drawing data.
- **Duplicate Name**: Creation fails with 409 Conflict if name exists.

### MVC & Stack Mapping *(mandatory)*

- **Frontend Models**:
    - `drawingStore.ts`: Manages current drawing name, list of items, and save status.
    - `fabricSceneStore.ts`: Updates to reflect loaded items.
- **Frontend Controllers & Views**:
    - `+page.svelte`: Main drawing interface.
    - `DrawingList.svelte`: Sidebar/modal to pick drawing.
- **Backend Models & Services**:
    - `models.py`: Pydantic models for `DrawingItem`, `Line`, `Drawing`.
    - `services/drawing_service.py`: Handles file I/O.
- **Backend Controllers**:
    - `routers/drawings.py`: `GET /`, `POST /`, `GET /{name}`, `PUT /{name}`.
- **Shared Schemas**:
    - JSON schema for Drawing Item (Line: p1, p2, color, weight, style).

## Requirements *(mandatory)*

1.  **Data Model**:
    - System must support drawings composed of an ordered list of graphical items.
    - System must support a "Line" item type defined by:
        - Start point (x, y) in screen pixels (origin top-left)
        - End point (x, y) in screen pixels
        - Color (hex code)
        - Line weight (numeric)
        - Line style (solid, dashed, dotted)

2.  **Drawing Management**:
    - System must provide a mechanism to retrieve a list of available drawing names.
    - System must provide a mechanism to retrieve the full content of a specific drawing by name.
    - System must provide a mechanism to save the content of a specific drawing.
    - System must provide a mechanism to create a new, empty drawing.
    - System must enforce unique drawing names and reject creation of duplicates.

3.  **Rendering & Interaction**:
    - System must render drawing items on the canvas in the order they are stored (index 0 at the back).
    - System must automatically save changes to the drawing after 2 seconds of user inactivity.
    - Canvas must be infinite/responsive, expanding to fit the viewport or content without fixed boundaries.

## Success Criteria *(mandatory)*

- [ ] User can view a list of available drawings.
- [ ] User can load a drawing and see all lines rendered correctly in the specified order.
- [ ] User changes are persisted automatically after 2 seconds of inactivity.
- [ ] Data integrity is enforced (invalid drawing data is rejected).
- [ ] System handles concurrent read/write operations without corruption.

## Assumptions

- Drawings are stored as JSON files in a `backend/data` directory.
- No authentication required for this iteration.
- "Drawing name" is the filename (without extension in URL, or with).
- JSON format is used for persistence (human-readable, standard).

### Functional Requirements

- **FR-001**: Frontend MUST fetch the list of available drawings from `GET /api/drawings` on initialization.
- **FR-002**: Frontend MUST render the drawing items on the Fabric.js canvas upon loading a drawing.
- **FR-003**: Frontend MUST debounce save requests to `PUT /api/drawings/{name}` by 2 seconds after the last modification.
- **FR-004**: Backend MUST validate incoming drawing data against the Pydantic `Drawing` model.
- **FR-005**: Backend MUST persist drawings as JSON files in the configured data directory.
- **FR-006**: Backend MUST return 409 Conflict if a user attempts to create a drawing with an existing name.
- **FR-007**: System MUST use a screen-pixel coordinate system (1 unit = 1 pixel) with (0,0) at the top-left.

### Key Entities *(include if feature involves data)*

- **Drawing**: Represents a single file containing a list of items.
- **DrawingItem**: Polymorphic base class for all graphical elements.
- **Line**: Specific item type with start/end points, color, weight, and style.

### Tooling & Documentation Requirements *(mandatory)*

- **Lint/Format**: Note eslint + prettier (frontend) or ruff (backend) impacts.
- **Package Management**: Specify required `uv add` commands or dependency removals.
- **Docs**: Identify updates under `frontend/src/routes/docs` and changelog notes.
- **CI Considerations**: List Vitest, Playwright, Pytest, and Behave suites or GitHub Actions jobs affected.

## Success Criteria *(mandatory)*

<!--
  ACTION REQUIRED: Define measurable success criteria.
  These must be technology-agnostic and measurable.
-->

### Measurable Outcomes

- **SC-001**: Users can create, load, edit, and auto-save a drawing with lines without errors.
- **SC-002**: Backend API responds to drawing operations within 200ms (excluding network latency).
- **SC-003**: Automated Vitest, Playwright, and Pytest suites pass for all new components and endpoints.
- **SC-004**: Documentation is updated to include the new API endpoints and data model structure.
