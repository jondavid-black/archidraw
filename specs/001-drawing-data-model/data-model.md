# Data Model: Drawing Data Model & Persistence

**Feature**: Drawing Data Model & Persistence
**Status**: Draft

## Entities

### Drawing
Represents a single drawing file.

| Field | Type | Description | Validation |
|---|---|---|---|
| `version` | `string` | Schema version | Default "1.0" |
| `objects` | `List[DrawingItem]` | Ordered list of drawing items | Polymorphic list |

### DrawingItem (Polymorphic Base)
Base attributes common to all Fabric.js objects.

| Field | Type | Description | Validation |
|---|---|---|---|
| `type` | `string` | Discriminator field | e.g., "line" |
| `left` | `float` | X position | |
| `top` | `float` | Y position | |
| `width` | `float` | Object width | |
| `height` | `float` | Object height | |
| `scaleX` | `float` | Horizontal scale | Default 1.0 |
| `scaleY` | `float` | Vertical scale | Default 1.0 |
| `angle` | `float` | Rotation angle | Default 0 |
| `stroke` | `string` | Stroke color | Hex or RGB |
| `strokeWidth` | `float` | Stroke thickness | >= 0 |

### Line (Extends DrawingItem)
Specific attributes for a line object.

| Field | Type | Description | Validation |
|---|---|---|---|
| `type` | `Literal["line"]` | Discriminator value | Must be "line" |
| `x1` | `float` | Start X (relative) | |
| `y1` | `float` | Start Y (relative) | |
| `x2` | `float` | End X (relative) | |
| `y2` | `float` | End Y (relative) | |
| `strokeDashArray` | `List[float] \| None` | Dash pattern | Optional |

## Storage Schema

Drawings are stored as JSON files in `backend/data/`.
Filename: `{name}.json`

```json
{
  "version": "1.0",
  "objects": [
    {
      "type": "line",
      "left": 100,
      "top": 100,
      "width": 200,
      "height": 200,
      "stroke": "red",
      "strokeWidth": 2,
      "x1": -100,
      "y1": -100,
      "x2": 100,
      "y2": 100
    }
  ]
}
```
