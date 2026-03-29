from motor.motor_asyncio import AsyncIOMotorClient
import os

# MongoDB Atlas Cloud Cluster — persistent, available from both Laptop and Jetson
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb+srv://Admin:password1234@cluster0.oo2i6jj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
DB_NAME = "hackathon_db"

class Database:
    client: AsyncIOMotorClient = None
    db = None

db_config = Database()

async def connect_to_mongo():
    print(f"[DB] Initializing Local MongoDB Connection at {MONGODB_URL}...")
    db_config.client = AsyncIOMotorClient(MONGODB_URL, serverSelectionTimeoutMS=5000, tlsAllowInvalidCertificates=True)
    db_config.db = db_config.client[DB_NAME]
    
    # Pre-map the core collections
    db_config.users = db_config.db.get_collection("users")
    db_config.portfolios = db_config.db.get_collection("portfolios")
    db_config.market_intel = db_config.db.get_collection("market_intel")
    
    # Only verify connection if we're actually starting the server to avoid crashing pre-flight execution
    print(f"[DB] Connected and mapped to '{DB_NAME}' successfully! 🚀")

async def close_mongo_connection():
    if db_config.client:
        print("[DB] Closing Local MongoDB connection...")
        db_config.client.close()
        print("[DB] Connection closed gracefully.")

def get_db():
    return db_config.db
