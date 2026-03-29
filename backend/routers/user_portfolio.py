from fastapi import APIRouter, HTTPException, UploadFile, File
from pydantic import BaseModel
from typing import List, Optional
import yfinance as yf
from database import db_config
from excel_parser import parse_excel_portfolio

router = APIRouter()

COLORS = ['#10b981', '#0ea5e9', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#f97316', '#ec4899']

@router.get("/price/{ticker}")
async def get_live_price(ticker: str):
    """Lookup live current price for any ticker via yfinance — used for real-time form preview."""
    try:
        hist = yf.Ticker(ticker).history(period="1d")
        if hist.empty:
            return {"status": "not_found", "ticker": ticker, "price": None}
        price = round(float(hist["Close"].iloc[-1]), 2)
        info = yf.Ticker(ticker).info
        name = info.get("longName") or info.get("shortName") or ticker
        return {"status": "success", "ticker": ticker, "price": price, "name": name}
    except Exception as e:
        return {"status": "error", "ticker": ticker, "price": None, "error": str(e)}

class AssetAdd(BaseModel):
    ticker: str
    name: str
    units: float
    buy_price: float
    asset_type: str

async def _fetch_live_price(ticker: str, buy_price: float) -> float:
    """Fetch live price disabled as requested; immediate fallback to buy_price."""
    return buy_price

async def _recompute_and_save(token: str, assets: list):
    """Recalculate allocation % and upsert to MongoDB Atlas."""
    total = sum(h["current_value"] for h in assets)
    for i, h in enumerate(assets):
        h["allocation_percentage"] = round((h["current_value"] / total) * 100, 1) if total else 0
        h["value"] = h["allocation_percentage"]
        h["color"] = COLORS[i % len(COLORS)]
    await db_config.db["portfolios"].update_one(
        {"token": token},
        {"$set": {"token": token, "assets": assets}},
        upsert=True
    )

@router.get("/{token}")
async def get_portfolio(token: str):
    """Fetch portfolio purely from MongoDB Atlas — zero hardcoded data."""
    doc = await db_config.db["portfolios"].find_one({"token": token})
    assets = doc["assets"] if doc else []
    total = sum(h.get("current_value", 0) for h in assets)
    return {"status": "success", "net_worth": round(total, 2), "assets": assets}

@router.post("/{token}/add")
async def add_asset(token: str, asset: AssetAdd):
    """Add a single asset with live price lookup, persist to Atlas."""
    doc = await db_config.db["portfolios"].find_one({"token": token})
    existing = doc["assets"] if doc else []

    current_price = await _fetch_live_price(asset.ticker, asset.buy_price)
    current_value = round(current_price * asset.units, 2)
    pnl = round((current_price - asset.buy_price) * asset.units, 2)
    pnl_pct = round(((current_price - asset.buy_price) / asset.buy_price) * 100, 2) if asset.buy_price else 0

    holding = {
        "id": f"{token}_{asset.ticker}_{len(existing)}",
        "ticker": asset.ticker,
        "name": asset.name,
        "units": asset.units,
        "buy_price": asset.buy_price,
        "current_price": round(current_price, 2),
        "current_value": current_value,
        "pnl": pnl,
        "pnl_pct": pnl_pct,
        "asset_type": asset.asset_type,
        "color": "#10b981"
    }
    existing.append(holding)
    await _recompute_and_save(token, existing)
    return {"status": "success", "holding": holding}

@router.post("/{token}/upload-excel")
async def upload_excel(token: str, file: UploadFile = File(...)):
    """
    Upload an Excel file (.xlsx/.xls), extract holdings, fetch live prices,
    APPEND to existing portfolio, and persist everything to MongoDB Atlas.
    """
    if not file.filename.endswith(('.xlsx', '.xls', '.csv')):
        raise HTTPException(status_code=400, detail="Only .xlsx, .xls, or .csv files are supported.")

    file_bytes = await file.read()
    try:
        raw_holdings = parse_excel_portfolio(file_bytes, file.filename)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))

    doc = await db_config.db["portfolios"].find_one({"token": token})
    existing = doc["assets"] if doc else []
    base_idx = len(existing)

    enriched = []
    for i, h in enumerate(raw_holdings):
        current_price = await _fetch_live_price(h["ticker"], h["buy_price"])
        current_value = round(current_price * h["units"], 2)
        pnl = round((current_price - h["buy_price"]) * h["units"], 2)
        pnl_pct = round(((current_price - h["buy_price"]) / h["buy_price"]) * 100, 2) if h["buy_price"] else 0

        enriched.append({
            "id": f"{token}_{h['ticker']}_{base_idx + i}",
            "ticker": h["ticker"],
            "name": h["name"],
            "units": h["units"],
            "buy_price": h["buy_price"],
            "current_price": round(current_price, 2),
            "current_value": current_value,
            "pnl": pnl,
            "pnl_pct": pnl_pct,
            "asset_type": h["asset_type"],
            "color": "#10b981"
        })

    all_assets = existing + enriched
    await _recompute_and_save(token, all_assets)

    return {
        "status": "success",
        "imported": len(enriched),
        "total_holdings": len(all_assets),
        "message": f"Successfully imported {len(enriched)} holdings from {file.filename}"
    }

@router.delete("/{token}/remove/{asset_id}")
async def remove_asset(token: str, asset_id: str):
    """Remove a holding from MongoDB Atlas."""
    doc = await db_config.db["portfolios"].find_one({"token": token})
    if not doc:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    updated = [h for h in doc["assets"] if h["id"] != asset_id]
    await _recompute_and_save(token, updated)
    return {"status": "success"}

@router.delete("/{token}/clear")
async def clear_portfolio(token: str):
    """Wipe all holdings for this user from Atlas."""
    await db_config.db["portfolios"].update_one(
        {"token": token},
        {"$set": {"assets": []}},
        upsert=True
    )
    return {"status": "success", "message": "Portfolio cleared"}
