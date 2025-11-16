# Database Setup and Usage Guide

## Overview

This backend uses **SQLAlchemy** for database ORM with support for:

- **PostgreSQL** (production on Render)
- **SQLite** (local development)

## Quick Start

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Local Development (SQLite)

No configuration needed! The app automatically creates a local `careerpath.db` SQLite file.

```bash
# Run the backend
uvicorn app.app:app --reload
```

Tables are created automatically on first run.

### 3. Production (PostgreSQL on Render)

**Create PostgreSQL Database on Render:**

1. Render Dashboard → New + → PostgreSQL
2. Name: `careerpath-db`
3. Database: `careerpath`
4. Plan: Free
5. Create Database

**Connect to Your Backend:**

1. Copy the **Internal Database URL** from Render PostgreSQL dashboard
2. Add to your Web Service → Environment:
   - Key: `DATABASE_URL`
   - Value: `postgresql://user:pass@host:5432/dbname` (paste your Internal URL)
3. Redeploy backend

The app automatically:

- Converts `postgres://` → `postgresql://` (Render compatibility)
- Creates all tables on startup
- Uses connection pooling for performance

## Database Models

### User

- Stores user information from Clerk authentication
- Fields: `id`, `clerk_id`, `email`, `username`, `created_at`, `is_active`

### Roadmap

- Stores AI-generated career paths
- Fields: `id`, `user_id`, `title`, `career_type`, `career_data` (JSON), `prompt`, `is_favorite`, `created_at`

### ChatMessage

- Stores AI chat history
- Fields: `id`, `user_id`, `role`, `content`, `cached`, `generation_time_ms`, `timestamp`

## Using the Database in Routes

```python
from fastapi import Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, Roadmap
from app.schemas import RoadmapCreate, RoadmapResponse

@router.post("/roadmaps", response_model=RoadmapResponse)
def create_roadmap(
    roadmap: RoadmapCreate,
    db: Session = Depends(get_db),
    current_user_id: int = 1  # Replace with actual auth
):
    # Create roadmap
    db_roadmap = Roadmap(
        user_id=current_user_id,
        title=roadmap.title,
        career_type=roadmap.career_type,
        career_data=roadmap.career_data,
        prompt=roadmap.prompt
    )
    db.add(db_roadmap)
    db.commit()
    db.refresh(db_roadmap)
    return db_roadmap

@router.get("/roadmaps", response_model=List[RoadmapResponse])
def list_roadmaps(
    db: Session = Depends(get_db),
    current_user_id: int = 1
):
    roadmaps = db.query(Roadmap).filter(
        Roadmap.user_id == current_user_id
    ).order_by(Roadmap.created_at.desc()).all()
    return roadmaps
```

## Database Migrations (Optional - Advanced)

For schema changes in production, use Alembic:

```bash
# Initialize Alembic (first time only)
alembic init alembic

# Create a migration
alembic revision --autogenerate -m "Add new field"

# Apply migrations
alembic upgrade head
```

## Environment Variables

| Variable       | Required | Default                     | Description                |
| -------------- | -------- | --------------------------- | -------------------------- |
| `DATABASE_URL` | No       | `sqlite:///./careerpath.db` | Database connection string |

**PostgreSQL Format:**

```
DATABASE_URL=postgresql://user:password@host:5432/database_name
```

**SQLite Format:**

```
DATABASE_URL=sqlite:///./careerpath.db
```

## Troubleshooting

**"No module named 'psycopg2'"**

- Run: `pip install psycopg2-binary`

**"Table already exists" error**

- Tables are created automatically. If you modified models, either:
  - Delete `careerpath.db` (local only)
  - Use Alembic migrations (production)

**Connection refused / timeout**

- Check `DATABASE_URL` is correct
- For Render: Use **Internal Database URL**, not External
- Ensure PostgreSQL service is running

**SQLite locked database**

- Only one connection can write at a time
- Use PostgreSQL for production with concurrent users

## Next Steps

1. ✅ Models created (`User`, `Roadmap`, `ChatMessage`)
2. ✅ Database connection configured
3. ✅ Schemas for validation created
4. 🔄 Add CRUD routes for roadmaps and chat
5. 🔄 Integrate with Clerk authentication
6. 🔄 Store AI-generated roadmaps
7. 🔄 Implement chat history persistence
