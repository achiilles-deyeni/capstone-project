from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from pathlib import Path
import json
import logging

router = APIRouter(prefix="/api/users", tags=["users"])
_logger = logging.getLogger(__name__)
DATA_DIR = Path(__file__).resolve().parents[1].parent / "data" / "users"
DATA_DIR.mkdir(parents=True, exist_ok=True)

class UserProfile(BaseModel):
    fullName: str | None = None
    firstName: str | None = None
    lastName: str | None = None
    email: str | None = None
    location: str | None = None
    joined: str | None = None


def _user_file(user_id: str) -> Path:
    return DATA_DIR / f"{user_id}.json"


@router.get("/{user_id}")
async def get_user_profile(user_id: str):
    f = _user_file(user_id)
    if not f.exists():
        # return empty profile
        return JSONResponse({"userId": user_id, "profile": {}})
    try:
        data = json.loads(f.read_text(encoding="utf-8"))
        return JSONResponse({"userId": user_id, "profile": data})
    except Exception as e:
        _logger.exception("Failed to read user profile %s: %s", user_id, e)
        raise HTTPException(status_code=500, detail="Failed to read user profile")


@router.put("/{user_id}")
async def put_user_profile(user_id: str, profile: UserProfile):
    f = _user_file(user_id)
    try:
        data = profile.dict()
        f.write_text(json.dumps(data, indent=2), encoding="utf-8")
        return JSONResponse({"userId": user_id, "profile": data})
    except Exception as e:
        _logger.exception("Failed to write user profile %s: %s", user_id, e)
        raise HTTPException(status_code=500, detail="Failed to write user profile")
