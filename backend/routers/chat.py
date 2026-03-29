from fastapi import APIRouter
from pydantic import BaseModel
from typing import Dict, Any

from ai_orchestrator import AIOrchestrator

router = APIRouter()
orchestrator = AIOrchestrator()

# Use Pydantic to strictly define the expected JSON payload
class ChatRequest(BaseModel):
    message: str
    portfolio_context: Dict[str, Any] = {}
    market_context: Dict[str, Any] = {}

@router.post("/")
async def chat_with_ai(request: ChatRequest):
    """
    Receives user messages from the React frontend, passes them to the Failsafe orchestrator,
    and returns the actionable advice.
    """
    response = await orchestrator.process_user_query(
        user_query=request.message,
        portfolio_data=request.portfolio_context,
        market_intel=request.market_context
    )
    return response
