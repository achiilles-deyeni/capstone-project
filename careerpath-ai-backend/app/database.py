"""
Database connection and session management.

This module handles database connections with support for both PostgreSQL (production)
and SQLite (development). It provides session management and dependency injection
for FastAPI routes.
"""
import os
import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool
from typing import Generator
from datetime import datetime, timedelta

from .models import models
from .models.models import Base

logger = logging.getLogger(__name__)

# Get database URL from environment or use SQLite for local development
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "sqlite:///./careerpath.db"  # Local SQLite fallback
)

# Handle Render's postgres:// → postgresql:// requirement
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

logger.info(f"Using database: {DATABASE_URL.split('@')[0] if '@' in DATABASE_URL else 'SQLite'}...")

# SQLite-specific configuration
connect_args = {}
engine_kwargs = {}

if DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}
    engine_kwargs = {
        "connect_args": connect_args,
        "poolclass": StaticPool,  # Required for SQLite with FastAPI
    }
    logger.info("Using SQLite database (local development)")
else:
    engine_kwargs = {
        "pool_pre_ping": True,  # Verify connections before using
        "pool_size": 5,
        "max_overflow": 10,
    }
    logger.info("Using PostgreSQL database (production)")

# Create engine
engine = create_engine(DATABASE_URL, **engine_kwargs)

# Create SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def create_tables():
    """Create all database tables. Call this on app startup."""
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("✓ Database tables created successfully")
    except Exception as e:
        logger.error(f"Failed to create database tables: {e}")
        raise


def get_db() -> Generator[Session, None, None]:
    """
    FastAPI dependency that provides a database session.
    
    Usage in routes:
        @router.get("/example")
        def example(db: Session = Depends(get_db)):
            users = db.query(User).all()
            return users
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def check_database_connection() -> bool:
    """Check if database connection is working."""
    try:
        with engine.connect() as conn:
            conn.execute("SELECT 1")
        logger.info("✓ Database connection successful")
        return True
    except Exception as e:
        logger.error(f"Database connection failed: {e}")
        return False