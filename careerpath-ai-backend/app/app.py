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
    "http://localhost:5173",  # Vite dev server
    "http://127.0.0.1:5173",
    "https://your-frontend-domain.vercel.app",  # production domain (optional)
]

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
