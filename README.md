# EduVerse AI - Smart Learning Platform for College Students

EduVerse AI is an AI and Machine Learning powered e-learning platform for college students. Learn subjects including FOC, Java, Advanced Java, DSA, C#, DBMS, Python, and Web Development through theory materials, coding practice, quizzes, AI tutoring, and ML-based performance prediction.

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React, Tailwind CSS, React Router, Axios, Chart.js |
| Backend | Node.js, Express.js, JWT, bcrypt |
| Database | PostgreSQL |
| ML Service | Python, Flask, Scikit-learn, Pandas, NumPy |
| AI | Google Gemini API |

## Project Structure

```
EduVerse AI/
├── frontend/          # React app (Vercel)
├── backend/           # Express API (Render)
├── ml-service/        # Python ML microservice
├── database/          # PostgreSQL schema
└── README.md
```

## Features

### Student
- Register, Login, Logout, Forgot Password (JWT)
- Dashboard with stats, charts, ML predictions
- 8 subjects with units, topics, notes, PDFs, videos
- Subject/topic-wise MCQ quizzes with instant scoring
- Coding practice (Java, Python, C, C#) with code editor
- AI Tutor (Gemini): doubts, explanations, examples, practice questions
- Progress tracking (quiz, coding, study time, completion)
- ML Analytics: predicted score, skill level, weak subjects

### Admin
- Dashboard: students, subjects, quizzes, avg performance
- Student management (view, search, delete)
- Content management (subjects, topics, notes, PDFs, videos)
- Quiz management (create, delete, view results)
- Dataset upload (CSV/Excel)
- ML training (Linear Regression + K-Means)

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Python 3.10+
- Gemini API key (optional — demo mode without it)

## Installation

### 1. Database Setup

```bash
# Create database
createdb eduverse

# Run schema
psql -U postgres -d eduverse -f database/schema.sql
```

### 2. Backend

```bash
cd backend
cp .env.example .env
# Edit .env with your DATABASE_URL, JWT_SECRET, GEMINI_API_KEY

npm install
npm run seed    # Seeds subjects, quizzes, demo users
npm run dev     # http://localhost:5000
```

### 3. ML Service

```bash
cd ml-service
python -m venv venv
# Windows: venv\Scripts\activate
# Mac/Linux: source venv/bin/activate

pip install -r requirements.txt
python app.py   # http://localhost:8000
```

### 4. Frontend

```bash
cd frontend
cp .env.example .env
# Set VITE_API_URL=http://localhost:5000/api

npm install
npm run dev     # http://localhost:5173
```

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@eduverse.ai | admin123 |
| Student | student@eduverse.ai | student123 |

## Environment Variables

### Backend (`backend/.env`)

```
PORT=5000
DATABASE_URL=postgresql://postgres:password@localhost:5432/eduverse
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d
GEMINI_API_KEY=your_gemini_key
ML_SERVICE_URL=http://localhost:8000
FRONTEND_URL=http://localhost:5173
```

### Frontend (`frontend/.env`)

```
VITE_API_URL=http://localhost:5000/api
```

### ML Service

```
PORT=8000
MODEL_DIR=./models
DATASET_DIR=./datasets
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register user |
| POST | /api/auth/login | Login |
| POST | /api/auth/forgot-password | Request reset |
| GET | /api/subjects | List subjects |
| GET | /api/quizzes | List quizzes |
| POST | /api/quizzes/:id/submit | Submit quiz |
| POST | /api/coding/submit | Submit code |
| GET | /api/progress/dashboard | Student dashboard |
| POST | /api/ai/chat | AI tutor chat |
| POST | /api/predictions/generate | Generate ML prediction |
| POST | /api/ml/upload | Upload dataset (admin) |
| POST | /api/ml/train | Train models (admin) |

## Deployment

### Frontend (Vercel)

1. Import `frontend` folder to Vercel
2. Set `VITE_API_URL` to your Render API URL
3. Deploy

### Backend (Render)

1. Create PostgreSQL database on Render
2. Deploy `backend` as Web Service
3. Set env vars: `DATABASE_URL`, `JWT_SECRET`, `GEMINI_API_KEY`, `ML_SERVICE_URL`, `FRONTEND_URL`
4. Run schema + seed against production DB

### ML Service (Render)

1. Deploy `ml-service` as Python Web Service
2. Start command: `gunicorn app:app`
3. Set `ML_SERVICE_URL` in backend to this service URL

## ML Dataset Format

CSV/Excel with columns:

```
quiz_score,coding_score,study_hours,attendance,final_marks
75,80,40,90,82
```

- **Linear Regression**: Predicts `final_marks`
- **K-Means**: Clusters students into Beginner / Intermediate / Advanced

## Security

- JWT authentication with role-based access
- bcrypt password hashing
- Protected API routes
- Admin-only routes for management
- express-validator input validation

## License

MIT — Built for educational purposes.
