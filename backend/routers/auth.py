from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
import hashlib, time
from database import db_config

router = APIRouter()

def _hash(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def _token(email: str) -> str:
    return hashlib.md5(f"{email}{time.time()}".encode()).hexdigest()

class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

class GoogleAuthRequest(BaseModel):
    email: str
    name: str
    picture: Optional[str] = ""

@router.post("/register")
async def register(req: RegisterRequest):
    users = db_config.db["users"]
    existing = await users.find_one({"email": req.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    token = _token(req.email)
    user_doc = {
        "name": req.name,
        "email": req.email,
        "password": _hash(req.password),
        "picture": "",
        "token": token
    }
    await users.insert_one(user_doc)
    return {"status": "success", "token": token, "user": {"name": req.name, "email": req.email, "picture": ""}}

@router.post("/login")
async def login(req: LoginRequest):
    users = db_config.db["users"]
    user = await users.find_one({"email": req.email})
    if not user or user["password"] != _hash(req.password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    token = user.get("token")
    if not token:
        token = _token(req.email)
        await users.update_one({"email": req.email}, {"$set": {"token": token}})
        
    return {"status": "success", "token": token, "user": {"name": user["name"], "email": user["email"], "picture": user.get("picture", "")}}

@router.post("/google")
async def google_auth(req: GoogleAuthRequest):
    users = db_config.db["users"]
    user = await users.find_one({"email": req.email})
    if not user:
        token = _token(req.email)
        await users.insert_one({
            "name": req.name, "email": req.email,
            "password": "", "picture": req.picture, "token": token
        })
    else:
        token = user.get("token")
        if not token:
            token = _token(req.email)
        await users.update_one({"email": req.email}, {"$set": {"token": token, "picture": req.picture}})
    return {"status": "success", "token": token, "user": {"name": req.name, "email": req.email, "picture": req.picture}}
