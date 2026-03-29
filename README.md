# Portfolio Manager (Hackathon Edition) 🚀

A distributed, dual-tier AI Portfolio Manager designed specifically for the Indian market. Built for extreme performance, edge-inference capabilities, and flawless live-demo execution.

## 🏗️ Architecture Stack

- **Frontend:** React (Vite) + Tailwind CSS + Recharts (Premium Dark Mode)
- **Backend:** Python 3.10+, FastAPI, Uvicorn
- **Database:** Local MongoDB (`motor` async driver) 
- **AI Core:** Dual-Tier system utilizing cloud ingestion (Jetson) and local inference (Laptop running Phi-3 via Ollama)

## 📁 Project Structure

```text
/
├── backend/
│   ├── main.py                # FastAPI App Init & MongoDB Lifecycle
│   ├── database.py            # Motor Async Client (mongodb://localhost:27017)
│   ├── ai_orchestrator.py     # Local LLM Routing & Demo Failsafe Core
│   ├── pdf_parser.py          # CAMS/KFintech Statement Parser (pdfplumber)
│   ├── requirements.txt       # Core Python dependencies
│   └── routers/
│       └── portfolio.py       # Portfolio endpoints (Bypasses Auth)
└── frontend/
    ├── package.json
    ├── tailwind.config.js
    └── src/
        ├── App.jsx
        ├── index.css          # Dark Mode & Tailwind global config
        └── components/
            ├── Dashboard.jsx  # Recharts asset allocation view
            └── AiChat.jsx     # Frontend connection to Local LLM
```

## 🚀 Execution Instructions

### Backend Setup
1. `cd backend`
2. `python -m venv venv`
3. `venv\Scripts\activate` (Windows)
4. `pip install -r requirements.txt`
5. Ensure a local MongoDB instance is running on port `:27017`
6. `uvicorn main:app --reload`

### Frontend Setup
1. `cd frontend`
2. `npm install`
3. `npm run dev`
