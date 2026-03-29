import pandas as pd
import io
from typing import List, Dict

def parse_excel_portfolio(file_bytes: bytes, filename: str) -> List[Dict]:
    """
    Parses an uploaded Excel file and extracts portfolio holdings.
    Supports common formats with columns like: Name, Ticker, Units, Buy Price, Type.
    Returns a clean list of holdings ready to be saved to MongoDB.
    """
    try:
        if filename.lower().endswith('.csv'):
            df = pd.read_csv(io.BytesIO(file_bytes))
        else:
            df = pd.read_excel(io.BytesIO(file_bytes), engine='openpyxl')
    except Exception as e:
        raise ValueError(f"Could not read file {filename}: {e}")

    # Normalize column names — strip spaces, lowercase
    df.columns = [str(c).strip().lower().replace(" ", "_") for c in df.columns]

    # Try to detect common column name variations
    COLUMN_MAP = {
        "ticker":     ["ticker", "symbol", "stock_symbol", "scrip", "isin", "scrip_code", "code", "asset_symbol"],
        "name":       ["name", "stock_name", "company", "company_name", "scheme_name", "fund_name", "instrument", "security", "stock", "asset"],
        "units":      ["units", "quantity", "qty", "shares", "units_held", "no_of_units", "amount", "no_of_shares", "balance"],
        "buy_price":  ["buy_price", "purchase_price", "avg_cost", "average_price", "nav", "cost_price", "price", "avg_price", "cost"],
        "asset_type": ["type", "asset_type", "instrument_type", "category", "class", "asset_class"],
    }

    def find_col(df, candidates):
        for c in candidates:
            if c in df.columns:
                return c
        return None

    ticker_col    = find_col(df, COLUMN_MAP["ticker"])
    name_col      = find_col(df, COLUMN_MAP["name"])
    units_col     = find_col(df, COLUMN_MAP["units"])
    buy_price_col = find_col(df, COLUMN_MAP["buy_price"])
    type_col      = find_col(df, COLUMN_MAP["asset_type"])

    if not name_col and not ticker_col:
        raise ValueError("File must have at least a 'Name' or 'Ticker' column.")
    if not units_col:
        raise ValueError("File must have a 'Units' or 'Quantity' column.")
    if not buy_price_col:
        raise ValueError("File must have a 'Buy Price' or 'Price' column.")

    holdings = []
    for _, row in df.iterrows():
        try:
            name       = str(row[name_col]).strip() if name_col else "Unknown"
            ticker     = str(row[ticker_col]).strip().upper() if ticker_col else name[:6].upper()
            units      = float(row[units_col])
            buy_price  = float(row[buy_price_col])
            asset_type = str(row[type_col]).strip() if type_col else "Equity"

            # Check for NaN cleanly
            if pd.isna(units) or pd.isna(buy_price) or units <= 0 or buy_price <= 0:
                continue
            if name in ("nan", "", "None") and ticker in ("NAN", "", "NONE"):
                continue

            holdings.append({
                "ticker":     ticker,
                "name":       name,
                "units":      units,
                "buy_price":  buy_price,
                "asset_type": asset_type
            })
        except (ValueError, TypeError):
            continue  # Skip malformed rows silently

    if not holdings:
        raise ValueError("No valid holdings found in the Excel file. Check column names and data.")

    return holdings
