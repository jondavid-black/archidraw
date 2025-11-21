# Research: Drawing Data Model

## 1. Fabric.js Line Serialization

When a Fabric.js `Line` object is serialized to JSON (via `toJSON()`), it produces a standard Fabric object structure with specific coordinates for the line.

### JSON Structure
```json
{
  "type": "line",
  "version": "5.3.0",
  "originX": "left",
  "originY": "top",
  "left": 100,
  "top": 100,
  "width": 200,
  "height": 200,
  "fill": "rgb(0,0,0)",
  "stroke": "black",
  "strokeWidth": 1,
  "strokeDashArray": null,
  "strokeLineCap": "butt",
  "strokeDashOffset": 0,
  "strokeLineJoin": "miter",
  "strokeUniform": false,
  "strokeMiterLimit": 4,
  "scaleX": 1,
  "scaleY": 1,
  "angle": 0,
  "flipX": false,
  "flipY": false,
  "opacity": 1,
  "shadow": null,
  "visible": true,
  "backgroundColor": "",
  "fillRule": "nonzero",
  "paintFirst": "fill",
  "globalCompositeOperation": "source-over",
  "skewX": 0,
  "skewY": 0,
  "x1": 0,
  "y1": 0,
  "x2": 200,
  "y2": 200
}
```

### Key Fields for Pydantic Model
- **Common Fields**: `type`, `left`, `top`, `width`, `height`, `scaleX`, `scaleY`, `angle`, `stroke`, `strokeWidth`.
- **Line Specific**: `x1`, `y1`, `x2`, `y2`.
- **Note**: Fabric.js `Line` coordinates (`x1`, `y1`, `x2`, `y2`) are relative to the object's center/origin in some contexts, but in the JSON output, they represent the points relative to the group or canvas if not transformed. However, `left` and `top` usually define the bounding box position.

## 2. Python Atomic File Writes

To prevent data corruption during a crash (e.g., power loss or process kill during write), the best practice is to write to a temporary file on the same filesystem and then atomically rename it over the target file.

### Best Practice: `os.replace`
In Python 3 (and specifically 3.12+), `os.replace(src, dst)` is the standard way to perform an atomic rename. It overwrites the destination if it exists.

### Implementation Pattern
```python
import os
import json
import tempfile
from pathlib import Path

def atomic_write_json(file_path: Path, data: dict):
    """
    Safely writes a dictionary to a JSON file using the atomic write pattern.
    """
    # Create a temp file in the same directory to ensure atomic move (same filesystem)
    # delete=False is required to close and then rename
    temp_file = tempfile.NamedTemporaryFile(
        mode='w', 
        dir=file_path.parent, 
        delete=False,
        encoding='utf-8'
    )
    
    try:
        json.dump(data, temp_file, indent=2)
        temp_file.flush()
        os.fsync(temp_file.fileno()) # Ensure data is physically written to disk
        temp_file.close()
        
        # Atomic replacement
        os.replace(temp_file.name, file_path)
    except Exception:
        # Clean up temp file if something goes wrong
        if os.path.exists(temp_file.name):
            os.remove(temp_file.name)
        raise
```

## 3. Pydantic Polymorphism (V2)

Pydantic V2 uses `Annotated` and `Field(discriminator=...)` to handle polymorphic lists efficiently. This is often referred to as "Discriminated Unions".

### Code Example

```python
from typing import Annotated, Literal, Union, List
from pydantic import BaseModel, Field

# 1. Define the specific models with a literal 'type' field
class Line(BaseModel):
    type: Literal['line']
    x1: float
    y1: float
    x2: float
    y2: float
    stroke: str = "black"

class Circle(BaseModel):
    type: Literal['circle']
    radius: float
    x: float
    y: float
    fill: str = "transparent"

# 2. Define the Union with a discriminator
# The discriminator tells Pydantic which model to use based on the 'type' field value.
DrawingItem = Annotated[
    Union[Line, Circle], 
    Field(discriminator='type')
]

# 3. Define the container model
class Drawing(BaseModel):
    id: str
    items: List[DrawingItem]

# --- Usage Example ---

data = {
    "id": "drawing-001",
    "items": [
        {
            "type": "line",
            "x1": 0, "y1": 0, "x2": 100, "y2": 100,
            "stroke": "red"
        },
        {
            "type": "circle",
            "x": 50, "y": 50, "radius": 25
        }
    ]
}

model = Drawing.model_validate(data)
print(model)
# Output: 
# Drawing(id='drawing-001', items=[
#   Line(type='line', x1=0.0, y1=0.0, x2=100.0, y2=100.0, stroke='red'), 
#   Circle(type='circle', radius=25.0, x=50.0, y=50.0, fill='transparent')
# ])

# Validation Error Example
try:
    Drawing.model_validate({
        "id": "bad",
        "items": [{"type": "triangle", "points": []}] # 'triangle' not in Union
    })
except Exception as e:
    print(e)
```
