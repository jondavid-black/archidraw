# Quickstart: Drawing Data Model

## Prerequisites
- Backend running: `cd backend && uv run fastapi dev app/main.py`
- Frontend running: `cd frontend && npm run dev`

## Usage

1.  **List Drawings**:
    - Open browser to `http://localhost:5173/`
    - Sidebar should show list of drawings (initially empty).

2.  **Create Drawing**:
    - Click "New Drawing".
    - Enter name "test-1".
    - Verify "test-1" appears in list and canvas loads.

3.  **Draw Line**:
    - (Assuming drawing tools exist, otherwise manually seed data).
    - Since drawing tools are not in this spec, you can manually seed a file:
      ```bash
      echo '{"version": "1.0", "objects": [{"type": "line", "left": 100, "top": 100, "x1": -50, "y1": 0, "x2": 50, "y2": 0, "stroke": "red", "strokeWidth": 2}]}' > backend/data/test-1.json
      ```
    - Refresh page and load "test-1".
    - Verify red line appears.

4.  **Auto-Save**:
    - Modify the line (move/resize) on canvas.
    - Wait 2 seconds.
    - Check `backend/data/test-1.json` timestamp/content to verify save.
