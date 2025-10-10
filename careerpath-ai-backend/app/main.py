from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

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

@app.get("/")
def root():
    return {"message": "CareerPath AI backend is running successfully 🚀"}

@app.get("/api/careers")
def get_careers():
    return [
        {"id": 1, "title": "Frontend Developer", "skills": ["HTML", "CSS", "React"]},
        {"id": 2, "title": "Data Scientist", "skills": ["Python", "ML", "Pandas"]},
        {"id": 3, "title": "UI/UX Designer", "skills": ["Figma", "User Research"]},
    ]
