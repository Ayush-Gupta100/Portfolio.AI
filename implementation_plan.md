# Portfolio Manager Architecture (Hackathon Edition)

Build a scalable, extensible, AI-powered Portfolio Manager web application optimized for a live hackathon demo. This production-grade system uses live market data, a decoupled **distributed edge architecture** (Jetson + Laptop), and a dual-tier AI system designed to minimize premium API calls while guaranteeing a flawless live pitch.

## Proposed Strategy & Architecture

To guarantee a winning Demo Day presentation, we are stripping out unnecessary features (like Auth) and splitting the workload across your hardware capabilities.

### Tech Stack Updates
-   **Frontend:** React (Vite) + Tailwind CSS + Recharts (Dark-mode financial aesthetics).
-   **Backend:** Python with FastAPI. 
-   **Database:** **Local MongoDB Instance** (Running directly on the laptop to prevent live-demo WiFi failures. The Jetson streams data via the local LAN IP).
-   **Local LLM Inference Framework:** Ollama running `Phi-3-Mini` (Extremely fast, low VRAM impact on the RTX 2050).

### Hardware Distribution (The Microservice Split)
1. **The Jetson 8GB (Data Ingestion Engine):**
   - Runs an isolated Python script/cron job every 10 minutes. 
   - Uses `yfinance` for stock prices.
   - Pings **Gemini/Groq** APIs for global market summaries.
   - Pushes all data to the **Local MongoDB Instance** running on the Laptop (via local LAN IP).
2. **The Laptop (Core Application & UI):**
   - Hosts the React frontend and Vite development server.
   - Hosts the FastAPI backend and Local MongoDB instance.
   - Runs the Local LLM (Phi-3-Mini) for the Personalized Advisor.
   - Bridges the local server to the external world using `ngrok` for the live scan-to-view demo.

## Proposed Changes

### Backend (Laptop - FastAPI + MongoDB + PDF Parsing)
- **`backend/main.py`**: Application entry point. Initializes the MongoDB connection (`motor` async driver).
- **`backend/database.py`**: MongoDB configuration and collection references (`users`, `portfolios`, `market_intel`).
- **`backend/pdf_parser.py` [NEW]**: Handles extracting portfolio holdings from user-uploaded **CAMS / KFintech** Mutual Fund statement PDFs using `pdfplumber`. Provides real statement validation for your demo.
- **`backend/ai_orchestrator.py`**: The core routing logic.
  - Contains the **"Demo Failsafe"**: specifically listening for *"Analyze my tech portfolio against today's market"* to instantly return a pre-computed success payload.
  - Integrates with the local Phi-3-Mini model.
- **`backend/routers/portfolio.py`**: Hardcoded to a global "Demo User" entity. Pre-populated with India-specific tickers like Reliance (RELIANCE.NS) and Tata Motors (TATAMOTORS.NS).

### Edge Worker (Jetson - Data Ingestion)
- **`jetson_worker/ingestion_engine.py`**: A standalone script for querying global market state via Gemini/Groq and writing to MongoDB.

### Frontend (React + Vite)
- **`frontend/src/components/Dashboard.jsx`**: Provides the core visual hook: rich charts spanning the predefined Tata/Reliance assets, the global market health indicator, and the local AI advisor panel.
- **`frontend/src/components/AiChat.jsx`**: The chat overlay demonstrating the Local Edge AI in action.
