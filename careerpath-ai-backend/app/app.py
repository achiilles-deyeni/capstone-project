from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
import os
import logging
from dotenv import load_dotenv

# Load environment variables from .env if present
load_dotenv()

# Try to import Clerk SDK; if it's not installed, continue without it.
try:
    from clerk_backend_api import Clerk
    _has_clerk = True
except Exception:
    Clerk = None
    _has_clerk = False
    logging.getLogger(__name__).warning(
        "clerk_backend_api is not installed; Clerk features will be disabled"
    )

# Initialize clerk_sdk only when the package is available and the env var is set.
clerk_sdk = None
if _has_clerk:
    clerk_key = os.getenv("CLERK_SECRET_KEY")
    if clerk_key:
        clerk_sdk = Clerk(bearer_auth=clerk_key)
    else:
        logging.getLogger(__name__).warning(
            "CLERK_SECRET_KEY is not set; Clerk features will be disabled"
        )

app = FastAPI()

# Allow frontend (React + Vite) to access backend
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://learnrite.netlify.app",
    "https://<your-vercel-domain>.vercel.app"
]

import os
from fastapi.middleware.cors import CORSMiddleware

# prefer ALLOW_ORIGINS env or fallback to a default
origins_env = os.getenv("ALLOW_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173")
origins = [o.strip() for o in origins_env.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
try:
    from .routes.roadmaps import router as roadmaps_router
    app.include_router(roadmaps_router)
except Exception:
    logging.getLogger(__name__).warning("Failed to include roadmaps router")

try:
    from .routes.users import router as users_router
    app.include_router(users_router)
except Exception:
    logging.getLogger(__name__).warning("Failed to include users router")

try:
    from .routes.ai import router as ai_router
    app.include_router(ai_router)
except Exception:
    logging.getLogger(__name__).warning("Failed to include ai router")


# Log registered routes at startup to help debug missing endpoints
@app.on_event("startup")
async def _log_routes_on_startup():
    logger = logging.getLogger(__name__)
    try:
        # Log resolved CORS origins to help diagnose browser preflight issues
        logger.info("Resolved CORS allow_origins: %s", origins)
        logger.info("Listing registered routes:")
        for route in app.routes:
            methods = getattr(route, "methods", None)
            # Some route objects are Starlette routing types; show path and methods
            logger.info("%s %s %s", getattr(route, "name", "-"), getattr(route, "path", "-"), methods)
    except Exception as e:
        logger.exception("Failed to list routes: %s", e)


# Temporary debug route to list registered paths at runtime
@app.get("/debug/routes")
async def _debug_routes():
    paths = []
    for route in app.routes:
        paths.append({
            "name": getattr(route, "name", None),
            "path": getattr(route, "path", None),
            "methods": list(getattr(route, "methods", [])) if getattr(route, "methods", None) else None,
        })
    return {"routes": paths}


@app.get("/debug/ai-status")
async def _debug_ai_status():
    """Attempt to initialize the GenAI client and return a short status.

    Useful for debugging credentials or missing SDKs without running a model call.
    """
    try:
        from .services.ai_generator import check_genai_client
    except Exception as imp:
        logging.getLogger(__name__).exception("Failed to import ai_generator for debug: %s", imp)
        return {"ok": False, "message": "Failed to import ai_generator"}

    status = check_genai_client()
    return status
