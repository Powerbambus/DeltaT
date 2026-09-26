from fastapi import FastAPI

import app.models.__init__
from app.models.base import Base
from app.db.session import engine
from app.api.entries import router as entries_router

app = FastAPI()
app.include_router(entries_router, prefix="/time_entries")

@app.get("/")
async def root():
    return {"message": "Hello World"}

Base.metadata.create_all(bind=engine)