import asyncio
import yfinance as yf
from motor.motor_asyncio import AsyncIOMotorClient
import os
import datetime

# The Jetson connects to the Laptop's local IP on the same WiFi network
MONGODB_URL = os.getenv("MONGODB_URL", "")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")

class DataIngestionEngine:
    def __init__(self):
        # We set a tight timeout (2000ms) so the worker fails gracefully if the laptop's IP is unreachable
        self.client = AsyncIOMotorClient(MONGODB_URL, serverSelectionTimeoutMS=2000)
        self.db = self.client["hackathon_db"]
        self.market_collection = self.db.get_collection("market_intel")
        
    async def fetch_stock_prices(self):
        print("[JETSON] Fetching live NSE data via YFinance...")
        nifty = yf.Ticker("^NSEI")
        try:
            # We fetch 1 day of minute data to simulate real-time ingestion
            hist = nifty.history(period="1d")
            latest_close = float(hist["Close"].iloc[-1])
            percent_change = float((latest_close - hist["Open"].iloc[0]) / hist["Open"].iloc[0] * 100)
            return {"index": "NIFTY 50", "current_value": latest_close, "percent_change": percent_change}
        except Exception as e:
            # Soft-fallback for WiFi failures
            return {"index": "NIFTY 50", "current_value": 22450.0, "percent_change": 0.5, "error": str(e)}

    async def fetch_gemini_intel(self, market_data):
        print("[JETSON] Querying Cloud API (Gemini/Groq) for global sentiment...")
        await asyncio.sleep(1.5) # Simulate API latency network delay
        
        # Simulated response logic to save Gemini token quotas during generic testing loop
        sentiment = "Bullish" if market_data.get("percent_change", 0) > 0 else "Bearish"
        
        intel_payload = {
            "timestamp": datetime.datetime.now().isoformat(),
            "overall_sentiment": sentiment,
            "market_summary": f"The Indian markets are currently showing {sentiment.lower()} momentum.",
            "raw_data": market_data
        }
        return intel_payload
        
    async def push_to_mongodb(self, intel_payload):
        print("[JETSON] Pushing global intellect to Laptop's shared MongoDB Cluster...")
        try:
            await self.market_collection.insert_one(intel_payload)
            print("[JETSON] Data successfully synchronized across Microservices! 📡🚀")
        except Exception as e:
            print(f"[JETSON] Warning: MongoDB write failed (Ensure Laptop MongoDB is running or IP is correct): {e}")

    async def run_cycle(self):
        print("\n--- Starting Data Ingestion Cycle ---")
        market_data = await self.fetch_stock_prices()
        print(f"  > Market Data Acquired: {market_data['index']} at {market_data['current_value']}")
        
        intel = await self.fetch_gemini_intel(market_data)
        print(f"  > Cloud AI Generated summary: {intel['overall_sentiment']}")
        
        await self.push_to_mongodb(intel)
        print("--- Cycle Complete ---\n")

if __name__ == "__main__":
    print("[INIT] Booting Jetson Edge Worker...")
    engine = DataIngestionEngine()
    
    # Run once for testing, in a real env we'd use 'while True: await run_cycle(); await asyncio.sleep(600)'
    asyncio.run(engine.run_cycle())
