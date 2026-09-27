from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import app.models.__init__
from app.models.base import Base
from app.db.session import engine
from app.api.auth import router as auth_router
from app.api.entries import router as entries_router
from app.api.contracts import router as contracts_router
from app.api.statistics import router as statistic_router

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    # dev-only: allow any localhost port, since the frontend's dev server
    # port shifts depending on what else is already running locally
    allow_origin_regex=r"http://localhost:\d+",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(auth_router, prefix="/auth", tags=["auth"])
app.include_router(entries_router, prefix="/time_entries")
app.include_router(contracts_router, prefix="/contracts")
app.include_router(statistic_router)

@app.get("/")
async def root():
    return {"message": "Hello World"}

Base.metadata.create_all(bind=engine)