from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


# =========================
# 載入 .env
# =========================

load_dotenv()


from app.routers import (
    auth,
    escape_rooms,
    studios,
    locations,
)


app = FastAPI(
    title="Journey Log API",
    description="Journey Log 的後端 API",
    version="1.0.0",
)


# =========================
# CORS
# =========================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://journey-log.asd6139884.workers.dev",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================
# Routers
# =========================

app.include_router(auth.router)
app.include_router(escape_rooms.router)
app.include_router(studios.router)
app.include_router(locations.router)


# =========================
# 基本 API
# =========================

@app.get("/")
def root():
    return {
        "message": "Journey Log API is running!"
    }


@app.get("/api/health")
def health_check():
    return {
        "status": "ok"
    }