from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel
import time
import logging
from typing import Any, Dict

# Import the AI generator lazily inside the handler to avoid import-time
# failures preventing the router from being included (e.g. missing optional
# provider SDK like `ollama`). This keeps the route registered and returns
# a clear 503 if the generator cannot be imported at request time.

router = APIRouter(prefix="/api/ai", tags=["ai"])

# Simple in-memory cache: prompt -> (timestamp, response)
_CACHE: Dict[str, Any] = {}
_CACHE_TTL = 60 * 5  # 5 minutes

# Simple in-memory rate limiter per IP
_RATE_LIMIT = {}
_RATE_LIMIT_WINDOW = 60  # seconds
_RATE_LIMIT_MAX = 10  # max requests per window


class AIPrompt(BaseModel):
    prompt: str


def _get_client_ip(request: Request) -> str:
    # Try common headers first, fallback to client.host
    xff = request.headers.get("x-forwarded-for")
    if xff:
        return xff.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


@router.post("/generate")
async def generate(request: Request, body: AIPrompt):
    ip = _get_client_ip(request)
    now = time.time()

    # rate limiting
    window = _RATE_LIMIT.get(ip)
    if not window:
        _RATE_LIMIT[ip] = [now]
    else:
        # remove old timestamps
        window = [t for t in window if now - t < _RATE_LIMIT_WINDOW]
        window.append(now)
        _RATE_LIMIT[ip] = window
        if len(window) > _RATE_LIMIT_MAX:
            logging.getLogger(__name__).warning("Rate limit exceeded for %s", ip)
            raise HTTPException(status_code=429, detail="Rate limit exceeded")

    # caching
    cached = _CACHE.get(body.prompt)
    if cached:
        ts, resp = cached
        if now - ts < _CACHE_TTL:
            return resp

    # call the AI generator (could be slow)
    try:
        try:
            # lazy import to avoid import-time dependency failures
            from ..services import ai_generator  # type: ignore
        except Exception as imp_exc:
            logging.getLogger(__name__).exception("AI generator import failed: %s", imp_exc)
            # Service not configured or missing dependency
            raise HTTPException(status_code=503, detail="AI generator is unavailable")

        result = ai_generator.generate_career_path_with_ai(body.prompt)
    except Exception as exc:
        # Any exception during AI generation should be logged and surfaced as 500.
        # If you have provider-specific exceptions (rate limits) you can inspect
        # `exc` here and map to 429, but to avoid hard dependency on provider
        # SDKs we catch generic Exception.
        logging.getLogger(__name__).exception("AI generation failed: %s", exc)
        raise HTTPException(status_code=500, detail="AI generation failed")

    # cache the result
    _CACHE[body.prompt] = (now, result)

    return result
