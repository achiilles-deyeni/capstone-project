# CareerPath AI — AI-Powered Career Guidance Platform

Empowering students and professionals to build smarter, more fulfilling career paths.
Built using React, FastAPI, and Bootstrap.
Supports SDG 8 — Decent Work and Economic Growth by promoting skill development and employability.

---

## 📘 Overview

CareerPath AI is an AI-driven career guidance web platform inspired by roadmap.sh.
It provides users with personalized career paths, dynamic learning roadmaps, AI-based career recommendations, and resume analysis — helping individuals align their skills and aspirations with market trends.

This project is developed as a Capstone Project under SDG 8: Promote sustained, inclusive, and sustainable economic growth, full and productive employment, and decent work for all.

---

## 🎯 Project Objectives

- Help users identify suitable career paths using AI-based assessments.
- Provide structured, interactive roadmaps for continuous learning.
- Offer resume feedback and skill gap analysis.
- Connect users to mentors, peers, and job market insights.
- Promote decent work and economic growth through skill empowerment.

---

## 🧠 Key Features

1. Career Assessment Quiz — Determines ideal career paths based on personality and skills.
2. AI Career Match — Suggests personalized career paths and learning routes.
3. Dynamic Roadmap Viewer — Interactive roadmap visualization inspired by roadmap.sh.
4. Resume Analyzer — Analyzes uploaded CVs and provides improvement suggestions.
5. Skill Gap Analysis — Highlights missing competencies for selected job roles.
6. Career Chatbot — Smart AI career coach for on-demand guidance.
7. Progress Tracker — Visual dashboards for user growth and milestones.

---

## 🏗️ Tech Stack

Frontend:

- React.js
- Vite
- Bootstrap 5
- Axios
- React Flow or D3.js (for roadmap visualization)

Backend:

- FastAPI
- PostgreSQL
- SQLAlchemy
- GeminiAI
- Pydantic

Hosting:

- Frontend: Netlify
- Backend: Render
- Database: Render

---

## 🧩 Project Structure

Frontend (React + Vite)
career-ai-frontend/
├── public/
│ └── index.html
├── src/
│ ├── components/
│ ├── pages/
│ ├── services/
│ ├── context/
│ ├── assets/
│ ├── App.jsx
│ └── main.jsx
└── package.json

Backend (FastAPI)
career-ai-backend/
├── app/
│ ├── main.py
│ ├── database.py
│ ├── models/
│ ├── routes/
│ ├── schemas/
│ ├── services/
│ ├── utils/
│ └── config.py
├── requirements.txt
└── run.py

---

## ⚙️ Installation & Setup

1. Clone the Repository
   git clone https://github.com/achiilles-deyeni/careerpath-ai.git
   cd careerpath-ai

2. Setup Backend (FastAPI)
   cd career-ai-backend
   python -m venv venv
   source venv/bin/activate (On Windows: venv\Scripts\activate)
   pip install -r requirements.txt
   uvicorn app.main:app --reload
   Backend runs on http://127.0.0.1:8000

3. Setup Frontend (React + Vite)
   cd career-ai-frontend
   npm install
   npm run dev
   Frontend runs on http://localhost:5173

---

## 🔌 API Endpoints (Sample)

POST /auth/register - Register user
POST /auth/login - Login and get JWT
POST /ai/career-match - AI career recommendation
GET /ai/roadmap/{id} - Get roadmap details
POST /resume/analyze - Resume evaluation
GET /careers/list - Fetch all career paths

---

## 🧱 Database Models (Sample)

User:
id, name, email, password_hash, interests, career_id, progress

Career:
id, title, description, skills_required, average_salary

Roadmap:
id, career_id, stage_name, stage_description, resources

---

## 🧠 AI Components

1. Career Recommender — Maps quiz answers to suitable careers.
2. Resume Analyzer — Evaluates CVs using NLP or GPT-based models.
3. Roadmap Generator — Dynamically adapts paths based on skill level.
4. Career Chatbot — GPT-powered career coach.

---

## 🧮 System Architecture

[React Frontend] <---> [FastAPI Backend] <---> [Database]
│
└──> [AI Engine] — (Career Match, Resume Analysis, Chatbot)

---

## 📊 SDG 8 Alignment

Target 8.5: Promotes productive employment via market-relevant careers.
Target 8.6: Supports youth employment through skill-matching and mentorship.
Target 8.9: Encourages growth by developing workforce capacity.

---

## 🧪 Development Roadmap

Phase 1 — Setup React + FastAPI + DB structure
Phase 2 — Implement auth, career models, and roadmaps
Phase 3 — Integrate AI for recommendations and resume analysis
Phase 4 — Build dashboard, chatbot, and roadmap visualization
Phase 5 — Testing, deployment, and documentation

---

## 🚀 Deployment

1. Deploy frontend to Netlify. URl: https://learnrite.netlify.app
2. Deploy backend to Render. URL: https://learnrite.onrender.com

---

## 🤝 Contribution

1. Fork the repository.
2. Create a feature branch.
3. Commit and push changes.
4. Open a pull request.

---

## 🧑‍💻 Team & Credits

Developed by: Achilles Deyeni
Capstone Project — SDG 8 (Decent Work and Economic Growth)
Supervised by: Achilles Deyeni
Institution: University of Mines and Technology

---

## 📜 License

MIT License — Open-source and free to use.

---

## 🌍 Contact

Email: deyeniachilles6@gmail.com
GitHub: https://github.com/achiilles-deyeni
LinkedIn: https://linkedin.com/in/achilles-deyeni

"Empowering every learner to design their career journey with clarity, confidence, and AI."
