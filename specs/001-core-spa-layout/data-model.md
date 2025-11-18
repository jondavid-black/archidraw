# Data Model — Fabric Canvas Baseline

## Overview

This milestone defines in-memory frontend stores that act as the Model layer for the minimal Fabric workspace. No backend persistence exists yet, but the schemas below prepare us for future FastAPI synchronization.

## Entities

### WorkspaceLayoutState
| Field | Type | Description | Validation |
| --- | --- | --- | --- |
| `viewportWidth` | number | Current layout width in pixels | Required, ≥ 320 |
| `viewportHeight` | number | Current layout height in pixels | Required, ≥ 320 |
| `breakpoint` | 'mobile' \| 'tablet' \| 'desktop' | Derived category for responsive rules | Required, matches enum |
| `pixelRatio` | number | `window.devicePixelRatio` snapshot | Required, between 1 and 3 |
| `gridEnabled` | boolean | Whether the Fabric pattern grid is active | Defaults to `false` |
| `lastResizeAt` | number | `performance.now()` timestamp of last resize event | Optional, monotonic increasing |

### FabricCanvasState
| Field | Type | Description | Validation |
| --- | --- | --- | --- |
| `status` | 'idle' \| 'initializing' \| 'ready' \| 'error' | Overall readiness flag mirrored in `canvasStatusStore` | Required |
| `background` | { `type`: 'solid' \| 'grid', `color`: string } | Background styling metadata | Required, color must be hex or CSS keyword |
| `zoom` | number | Current Fabric zoom factor | Required, ≥ 0.1 and ≤ 4 |
| `pan` | { `x`: number, `y`: number } | Fabric viewport translation | Required |
| `error` | { `message`: string, `code`?: string } \| `null` | Details when `status === 'error'` | Optional |
| `canvasRef` | `fabric.Canvas` \| `null` | Runtime Fabric instance reference | Optional (null until ready) |

### CanvasTelemetryEvent
| Field | Type | Description |
| --- | --- | --- |
| `event` | 'layout-mounted' \| 'fabric-initialized' \| 'fabric-ready' \| 'fabric-error' | Event identifier |
| `timestamp` | number | `performance.now()` timestamp |
| `payload` | Record<string, unknown> | Arbitrary metadata (duration, viewport, error details) |

## Relationships

- `WorkspaceLayoutState` publishes breakpoint + dimension updates that the Fabric canvas subscribes to for resize handling.
- `FabricCanvasState.status` drives the readiness overlay; when it transitions to `ready`, the overlay fades and focus returns to the canvas element.
- Each `CanvasTelemetryEvent` originates from state changes in the stores above and routes through the instrumentation shim before logging.

## State Transitions

1. **Boot**: `FabricCanvasState.status` transitions `idle → initializing` when `FabricStage` mounts and layout data is available.
2. **Ready**: After Fabric fires its `after:render`, state transitions `initializing → ready`, storing the canvas reference and emitting a telemetry event with duration metadata.
3. **Error**: Any Fabric initialization failure sets `status = 'error'`, populates `error`, disables grid, and triggers overlay messaging. Manual retry resets to `initializing`.
4. **Resize**: `WorkspaceLayoutState` updates dimensions; consumers throttle updates (≤5 per second). If grid is enabled, Fabric background pattern is recalculated only when width/height change by ≥8px to reduce churn.

## Validation Rules

- Store setters must guard against NaN/undefined and clamp values to allowed ranges (e.g., zoom, pixelRatio).
- Overlay component subscribes to `FabricCanvasState.status` and may only unblock pointer events when it equals `ready`.
- Telemetry publisher drops events lacking numeric timestamps to keep Playwright assertions deterministic.

## Open Questions

- None — outstanding decisions were resolved in `research.md`. Future milestones will expand this model when palette/sidebars require additional stores.
