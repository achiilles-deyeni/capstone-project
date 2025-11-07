from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
import os
import logging
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables from .env if present
load_dotenv()

# Try to import Clerk SDK; if it's not installed, continue without it.
try:
    from clerk_backend_api import Clerk
    _has_clerk = True
except Exception:
    Clerk = None
    _has_clerk = False
    logger.warning(
        "clerk_backend_api is not installed; Clerk features will be disabled"
    )

# Initialize clerk_sdk only when the package is available and the env var is set.
clerk_sdk = None
if _has_clerk:
    clerk_key = os.getenv("CLERK_SECRET_KEY")
    if clerk_key:
        clerk_sdk = Clerk(bearer_auth=clerk_key)
    else:
        logger.warning(
            "CLERK_SECRET_KEY is not set; Clerk features will be disabled"
        )

app = FastAPI(
    title="Career Path AI API",
    description="AI-powered career guidance and recommendations",
    version="1.0.0"
)

# =======================
# CORS Configuration - FIXED!
# =======================

# Get environment
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")

# Get allowed origins from environment variable or use defaults
origins_env = os.getenv(
    "ALLOW_ORIGINS",
    "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://127.0.0.1:3000"
)

# Parse origins from comma-separated string
origins = [o.strip() for o in origins_env.split(",") if o.strip()]

# Add production frontend URLs if they exist
if os.getenv("FRONTEND_URL"):
    origins.append(os.getenv("FRONTEND_URL"))

# For production on Render with Netlify/Vercel frontend
if ENVIRONMENT == "production":
    # Add your deployed frontend URLs
    production_origins = [
        "https://learnrite.netlify.app",
        # Add your Vercel domain when you deploy
        # "https://your-app.vercel.app",
    ]
    origins.extend(production_origins)

logger.info(f"CORS Configuration - Environment: {ENVIRONMENT}")
logger.info(f"CORS Allowed Origins: {origins}")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,  # Cache preflight for 1 hour
)

# =======================
# Register Routers
# =======================

try:
    from .routes.roadmaps import router as roadmaps_router
    app.include_router(roadmaps_router)
    logger.info("✓ Roadmaps router registered")
except Exception as e:
    logger.warning(f"Failed to include roadmaps router: {e}")

try:
    from .routes.users import router as users_router
    app.include_router(users_router)
    logger.info("✓ Users router registered")
except Exception as e:
    logger.warning(f"Failed to include users router: {e}")

try:
    from .routes.ai import router as ai_router
    app.include_router(ai_router)
    logger.info("✓ AI router registered")
except Exception as e:
    logger.warning(f"Failed to include ai router: {e}")

# =======================
# Root Endpoints
# =======================

@app.get("/")
async def root():
    """Root endpoint - API health check"""
    return {
        "message": "Career Path AI API",
        "status": "running",
        "version": "1.0.0",
        "environment": ENVIRONMENT,
        "docs": "/docs",
        "health": "/health"
    }

@app.get("/health")
async def health_check():
    """Detailed health check endpoint"""
    return {
        "status": "healthy",
        "environment": ENVIRONMENT,
        "cors_enabled": True,
        "allowed_origins_count": len(origins),
        "clerk_enabled": clerk_sdk is not None
    }

# =======================
# Startup Event
# =======================

@app.on_event("startup")
async def _log_routes_on_startup():
    """Log registered routes at startup to help debug missing endpoints"""
    try:
        logger.info("=" * 60)
        logger.info("Career Path AI API Starting Up")
        logger.info("=" * 60)
        logger.info(f"Environment: {ENVIRONMENT}")
        logger.info(f"CORS Origins: {origins}")
        logger.info(f"Clerk SDK: {'Enabled' if clerk_sdk else 'Disabled'}")
        logger.info("-" * 60)
        logger.info("Registered Routes:")
        
        for route in app.routes:
            methods = getattr(route, "methods", None)
            path = getattr(route, "path", "-")
            name = getattr(route, "name", "-")
            
            if methods:
                methods_str = ", ".join(sorted(methods))
                logger.info(f"  {methods_str:15} {path:40} ({name})")
            else:
                logger.info(f"  {'MOUNT':15} {path:40} ({name})")
        
        logger.info("=" * 60)
    except Exception as e:
        logger.exception(f"Failed to list routes: {e}")

# =======================
# Debug Endpoints
# =======================

@app.get("/debug/routes")
async def _debug_routes():
    """List all registered routes - useful for debugging"""
    paths = []
    for route in app.routes:
        paths.append({
            "name": getattr(route, "name", None),
            "path": getattr(route, "path", None),
            "methods": list(getattr(route, "methods", [])) if getattr(route, "methods", None) else None,
        })
    return {"routes": paths, "count": len(paths)}

@app.get("/debug/ai-status")
async def _debug_ai_status():
    """Check AI service status - useful for debugging GenAI client"""
    try:
        from .services.ai_generator import check_genai_client
    except Exception as imp:
        logger.exception(f"Failed to import ai_generator for debug: {imp}")
        return {
            "ok": False,
            "message": "Failed to import ai_generator",
            "error": str(imp)
        }

    status = check_genai_client()
    return status

@app.get("/debug/cors")
async def _debug_cors():
    """Show current CORS configuration"""
    return {
        "environment": ENVIRONMENT,
        "allowed_origins": origins,
        "allow_credentials": True,
        "allow_methods": ["*"],
        "allow_headers": ["*"],
    }

# =======================
# Error Handlers
# =======================

from fastapi import status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle validation errors gracefully"""
    logger.error(f"Validation error on {request.url}: {exc.errors()}")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "detail": "Validation error",
            "errors": exc.errors()
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Catch-all exception handler"""
    logger.exception(f"Unhandled exception on {request.url}: {exc}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": "Internal server error",
            "message": str(exc) if ENVIRONMENT == "development" else "An error occurred"
        }
    )
