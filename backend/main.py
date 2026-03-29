from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from database import connect_to_mongo, close_mongo_connection
from routers import portfolio, chat
from routers.auth import router as auth_router
from routers.user_portfolio import router as user_portfolio_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_to_mongo()
    yield
    await close_mongo_connection()

app = FastAPI(
    title="Dual-Tier AI Portfolio Manager",
    version="2.0 (Hackathon Edition)",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex="http://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(portfolio.router, prefix="/api/portfolio", tags=["Demo Portfolio"])
app.include_router(chat.router, prefix="/api/chat", tags=["Edge AI Orchestrator"])
app.include_router(auth_router, prefix="/api/auth", tags=["Authentication"])
app.include_router(user_portfolio_router, prefix="/api/user-portfolio", tags=["User Portfolio CRUD"])

@app.get("/")
async def root():
    return {"status": "ok", "message": "Portfolio Manager v2.0 — All systems operational"}
