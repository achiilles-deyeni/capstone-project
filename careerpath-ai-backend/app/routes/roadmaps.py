from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
import json
from pathlib import Path
import logging

import importlib

_md_mod = importlib.util.find_spec("markdown")
if _md_mod:
    markdown = importlib.import_module("markdown")
    _has_markdown = True
else:
    markdown = None
    _has_markdown = False

router = APIRouter(prefix="/api/roadmaps", tags=["roadmaps"])

DATA_DIR = Path(__file__).resolve().parents[1].parent / "data"
DOCS_DIR = Path(__file__).resolve().parents[1].parent / "docs" / "roadmaps"

_logger = logging.getLogger(__name__)

# Load metadata once at startup
_metadata = []
try:
    with open(DATA_DIR / "roadmaps.json", "r", encoding="utf-8") as f:
        _metadata = json.load(f)
except Exception as e:
    _logger.warning("Failed to load roadmaps metadata: %s", e)
    _metadata = []

@router.get("/", response_class=JSONResponse)
async def list_roadmaps():
    # return metadata without the doc path
    return [
        {k: v for k, v in item.items() if k != "doc"}
        for item in _metadata
    ]

@router.get("/{roadmap_id}")
async def get_roadmap(roadmap_id: str):
    item = next((r for r in _metadata if r.get("id") == roadmap_id or r.get("slug") == roadmap_id), None)
    if not item:
        raise HTTPException(status_code=404, detail="Roadmap not found")

    doc_path = item.get("doc") or f"{roadmap_id}.md"
    # doc_path in metadata is relative to the backend docs folder (e.g. docs/roadmaps/frontend.md)
    # normalize
    doc_file = DOCS_DIR / Path(doc_path).name

    content = ""
    html = ""
    if doc_file.exists():
        try:
            content = doc_file.read_text(encoding="utf-8")
            if _has_markdown:
                html = markdown.markdown(content)
        except Exception as e:
            _logger.exception("Failed to read roadmap doc %s: %s", doc_file, e)
    else:
        _logger.warning("Roadmap doc not found: %s", doc_file)

    response = {
        "id": item.get("id"),
        "title": item.get("title"),
        "slug": item.get("slug"),
        "summary": item.get("summary"),
        "source": item.get("source"),
        "doc": content,
        "html": html,
    }
    return JSONResponse(response)
