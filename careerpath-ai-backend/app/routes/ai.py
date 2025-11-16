from fastapi import APIRouter, Request, HTTPException, BackgroundTasks
from pydantic import BaseModel, Field, validator
import time
import hashlib
import logging
from typing import Any, Dict, Optional, Tuple
from collections import defaultdict
import asyncio
from functools import wraps

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/ai", tags=["ai"])

# Configuration
CACHE_TTL = 60 * 5  # 5 minutes
RATE_LIMIT_WINDOW = 60  # seconds
RATE_LIMIT_MAX = 10  # max requests per window per IP
MAX_PROMPT_LENGTH = 2000
CACHE_MAX_SIZE = 1000  # Maximum number of cached items

# In-memory storage
_CACHE: Dict[str, Tuple[float, Dict[str, Any]]] = {}
_RATE_LIMIT: Dict[str, list[float]] = defaultdict(list)
_CACHE_LOCK = asyncio.Lock()


class AIPrompt(BaseModel):
    """Request model for AI generation."""
    prompt: str = Field(
        ...,
        min_length=1,
        max_length=MAX_PROMPT_LENGTH,
        description="Career-related query for AI generation"
    )
    
    @validator('prompt')
    def validate_prompt(cls, v):
        """Validate and sanitize the prompt."""
        v = v.strip()
        if not v:
            raise ValueError("Prompt cannot be empty or only whitespace")
        return v


class AIResponse(BaseModel):
    """Response model for AI generation."""
    title: str
    explanation: str
    average_salary: str
    job_openings: str
    youtube_video_recommendation: str
    learning_resources: list[Dict[str, str]]
    cached: bool = False
    generation_time_ms: Optional[float] = None


class ErrorResponse(BaseModel):
    """Error response model."""
    detail: str
    error_type: Optional[str] = None


def _get_client_ip(request: Request) -> str:
    """Extract client IP address from request.
    
    Checks X-Forwarded-For header first (for proxy/load balancer scenarios),
    then falls back to direct client IP.
    """
    # Check X-Forwarded-For header (handles proxies/load balancers)
    xff = request.headers.get("x-forwarded-for")
    if xff:
        # Take the first IP (original client)
        return xff.split(",")[0].strip()
    
    # Check X-Real-IP header (alternative header)
    real_ip = request.headers.get("x-real-ip")
    if real_ip:
        return real_ip.strip()
    
    # Fallback to direct client
    return request.client.host if request.client else "unknown"


def _check_rate_limit(ip: str, now: float) -> bool:
    """Check if the IP has exceeded the rate limit.
    
    Args:
        ip: Client IP address
        now: Current timestamp
        
    Returns:
        True if rate limit is exceeded, False otherwise
    """
    # Get or initialize the window for this IP
    window = _RATE_LIMIT[ip]
    
    # Remove timestamps outside the current window
    window[:] = [t for t in window if now - t < RATE_LIMIT_WINDOW]
    
    # Check if limit exceeded
    if len(window) >= RATE_LIMIT_MAX:
        return True
    
    # Add current timestamp
    window.append(now)
    return False


def _evict_old_cache_entries():
    """Evict expired cache entries to prevent unbounded growth."""
    now = time.time()
    expired_keys = [
        key for key, (ts, _) in _CACHE.items()
        if now - ts >= CACHE_TTL
    ]
    
    for key in expired_keys:
        _CACHE.pop(key, None)
    
    # Also enforce max size by removing oldest entries
    if len(_CACHE) > CACHE_MAX_SIZE:
        # Sort by timestamp and keep only the newest entries
        sorted_items = sorted(_CACHE.items(), key=lambda x: x[1][0], reverse=True)
        _CACHE.clear()
        _CACHE.update(dict(sorted_items[:CACHE_MAX_SIZE]))
        logger.info("Cache size limit reached. Evicted %d entries", 
                   len(sorted_items) - CACHE_MAX_SIZE)


async def _get_cached_response(prompt: str, now: float) -> Optional[Dict[str, Any]]:
    """Check cache for a valid response.
    
    Args:
        prompt: The prompt to check
        now: Current timestamp
        
    Returns:
        Cached response if valid, None otherwise
    """
    async with _CACHE_LOCK:
        cached = _CACHE.get(prompt)
        if cached:
            ts, resp = cached
            if now - ts < CACHE_TTL:
                logger.info("Cache hit for prompt: %s", prompt[:50])
                return {**resp, "cached": True}
        return None


async def _set_cache(prompt: str, response: Dict[str, Any], now: float):
    """Set a response in the cache.
    
    Args:
        prompt: The prompt key
        response: The response to cache
        now: Current timestamp
    """
    async with _CACHE_LOCK:
        _CACHE[prompt] = (now, response)
        # Periodically clean up old entries
        if len(_CACHE) % 50 == 0:  # Every 50 additions
            _evict_old_cache_entries()


def _cleanup_rate_limits():
    """Background task to clean up old rate limit entries."""
    now = time.time()
    ips_to_remove = []
    
    for ip, window in _RATE_LIMIT.items():
        # Remove old timestamps
        window[:] = [t for t in window if now - t < RATE_LIMIT_WINDOW]
        # Mark empty windows for removal
        if not window:
            ips_to_remove.append(ip)
    
    for ip in ips_to_remove:
        _RATE_LIMIT.pop(ip, None)
    
    if ips_to_remove:
        logger.debug("Cleaned up rate limit data for %d IPs", len(ips_to_remove))


@router.post(
    "/generate",
    response_model=AIResponse,
    responses={
        200: {"description": "Successfully generated career path"},
        400: {"model": ErrorResponse, "description": "Invalid request"},
        429: {"model": ErrorResponse, "description": "Rate limit exceeded"},
        500: {"model": ErrorResponse, "description": "AI generation failed"},
        503: {"model": ErrorResponse, "description": "AI service unavailable"}
    },
    summary="Generate AI Career Path",
    description="Generate a comprehensive career roadmap using AI. Results are cached for 5 minutes."
)
async def generate(
    request: Request,
    body: AIPrompt,
    background_tasks: BackgroundTasks
):
    """Generate a career path roadmap using AI.
    
    This endpoint:
    - Rate limits requests to 10 per minute per IP
    - Caches responses for 5 minutes
    - Returns comprehensive career information including salary, resources, and recommendations
    
    Args:
        request: FastAPI request object
        body: Request body containing the prompt
        background_tasks: FastAPI background tasks for cleanup
        
    Returns:
        AIResponse with career path information
        
    Raises:
        HTTPException: Various HTTP errors for different failure scenarios
    """
    start_time = time.time()
    ip = _get_client_ip(request)
    now = time.time()
    
    # Avoid logging user prompt plaintext (may contain PII). Log a short hash and length instead.
    prompt_hash = hashlib.sha256(body.prompt.encode('utf-8')).hexdigest()[:8]
    logger.info("Received AI generation request from IP: %s, prompt_hash: %s, prompt_len: %d", 
               ip, prompt_hash, len(body.prompt))
    
    # Rate limiting check
    if _check_rate_limit(ip, now):
        logger.warning("Rate limit exceeded for IP: %s", ip)
        raise HTTPException(
            status_code=429,
            detail=f"Rate limit exceeded. Maximum {RATE_LIMIT_MAX} requests per {RATE_LIMIT_WINDOW} seconds."
        )
    
    # Schedule cleanup in background
    background_tasks.add_task(_cleanup_rate_limits)
    
    # Check cache
    cached_response = await _get_cached_response(body.prompt, now)
    if cached_response:
        return cached_response
    
    # Import AI generator lazily to avoid import-time failures
    try:
        from ..services import ai_generator  # type: ignore
    except ImportError as imp_exc:
        logger.error("Failed to import AI generator module: %s", imp_exc)
        raise HTTPException(
            status_code=503,
            detail="AI generator service is not available. Please contact support."
        )
    except Exception as imp_exc:
        logger.exception("Unexpected error importing AI generator: %s", imp_exc)
        raise HTTPException(
            status_code=503,
            detail="AI generator service configuration error."
        )
    
    # Call AI generator
    try:
        result = ai_generator.generate_career_path_with_ai(body.prompt)
        
        # Calculate generation time
        generation_time_ms = (time.time() - start_time) * 1000
        result["generation_time_ms"] = round(generation_time_ms, 2)
        result["cached"] = False
        
        logger.info("AI generation successful for IP: %s (%.2fms)", 
                   ip, generation_time_ms)
        
        # Cache the result
        await _set_cache(body.prompt, result, now)
        
        return result
        
    except ValueError as val_err:
        # Handle validation errors from AI generator (e.g., invalid prompt)
        logger.warning("Validation error in AI generation: %s", val_err)
        raise HTTPException(
            status_code=400,
            detail=f"Invalid request: {str(val_err)}"
        )
    except TimeoutError:
        logger.error("AI generation timeout for IP: %s", ip)
        raise HTTPException(
            status_code=504,
            detail="AI generation timed out. Please try again."
        )
    except Exception as exc:
        # Catch-all for any other AI generation errors
        logger.exception("AI generation failed for IP: %s - %s", ip, exc)
        
        # Check if it's a known API error (optional - if you want specific handling)
        error_message = str(exc).lower()
        if "api key" in error_message or "authentication" in error_message:
            raise HTTPException(
                status_code=503,
                detail="AI service authentication error. Please contact support."
            )
        elif "quota" in error_message or "rate limit" in error_message:
            raise HTTPException(
                status_code=503,
                detail="AI service quota exceeded. Please try again later."
            )
        
        # Generic error response
        raise HTTPException(
            status_code=500,
            detail="AI generation failed. Please try again later."
        )


@router.get(
    "/health",
    summary="Check AI Service Health",
    description="Check if the AI service is available and properly configured"
)
async def health_check():
    """Check the health status of the AI service.
    
    Returns:
        Dictionary with health status information
    """
    try:
        from ..services import ai_generator  # type: ignore
        status = ai_generator.check_genai_client()
        return {
            **status,
            "cache_size": len(_CACHE),
            "cache_max_size": CACHE_MAX_SIZE,
            "rate_limit_tracked_ips": len(_RATE_LIMIT)
        }
    except Exception as exc:
        logger.exception("Health check failed: %s", exc)
        return {
            "ok": False,
            "message": f"AI service unavailable: {str(exc)}",
            "cache_size": len(_CACHE),
            "rate_limit_tracked_ips": len(_RATE_LIMIT)
        }


@router.post(
    "/clear-cache",
    summary="Clear Response Cache",
    description="Clear the AI response cache (admin endpoint - should be protected)"
)
async def clear_cache():
    """Clear the response cache.
    
    Note: This endpoint should be protected with authentication in production.
    
    Returns:
        Dictionary with the number of entries cleared
    """
    async with _CACHE_LOCK:
        cache_size = len(_CACHE)
        _CACHE.clear()
        logger.info("Cache cleared: %d entries removed", cache_size)
        return {
            "message": "Cache cleared successfully",
            "entries_removed": cache_size
        }


@router.get(
    "/stats",
    summary="Get API Statistics",
    description="Get usage statistics for the AI API"
)
async def get_stats():
    """Get API usage statistics.
    
    Returns:
        Dictionary with current statistics
    """
    return {
        "cache": {
            "size": len(_CACHE),
            "max_size": CACHE_MAX_SIZE,
            "ttl_seconds": CACHE_TTL
        },
        "rate_limit": {
            "tracked_ips": len(_RATE_LIMIT),
            "window_seconds": RATE_LIMIT_WINDOW,
            "max_requests_per_window": RATE_LIMIT_MAX
        }
    }