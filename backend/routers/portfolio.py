from fastapi import APIRouter

router = APIRouter()

@router.get("/")
async def get_demo_portfolio():
    """
    Bypassing auth entirely! 
    This hardcoded Demo User allows us to present a fully populated, 
    visually stunning dashboard on Demo Day without relying on a live database query first.
    """
    return {
        "status": "success",
        "user_id": "demo_user_001",
        "net_worth": 1250000,
        "assets": [
            {
                "ticker": "RELIANCE.NS",
                "name": "Reliance Industries",
                "allocation_percentage": 45,
                "current_value": 562500,
                "type": "Equity"
            },
            {
                "ticker": "TATAMOTORS.NS",
                "name": "Tata Motors",
                "allocation_percentage": 25,
                "current_value": 312500,
                "type": "Equity"
            },
            {
                "ticker": "CAMS_TECH_FUND",
                "name": "Tech Heavy Mutual Fund (KFintech)",
                "allocation_percentage": 30,
                "current_value": 375000,
                "type": "Mutual Fund"
            }
        ],
        "historical_performance": [
            {"month": "Jan", "value": 1100000},
            {"month": "Feb", "value": 1150000},
            {"month": "Mar", "value": 1250000}
        ]
    }
