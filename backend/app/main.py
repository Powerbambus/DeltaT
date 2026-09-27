from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.models.base import Base
from app.models.user import User
from app.db.session import engine, SessionLocal
from app.api.auth import router as auth_router
from app.api.entries import router as entries_router
from app.api.contracts import router as contracts_router
from app.api.statistics import router as statistic_router
from app.core.security import hash_password
from app.config import settings


@asynccontextmanager
async def lifespan(app: FastAPI):

    db = SessionLocal()
    try:
        existing_user = db.query(User).first()
        if existing_user is None:
            if settings.initial_user_email and settings.initial_user_password:
                new_user = User(
                    email=settings.initial_user_email,
                    password_hash=hash_password(settings.initial_user_password),
                )
                db.add(new_user)
                db.commit()
                print(f"Initial user created: {settings.initial_user_email}")
            elif settings.initial_user_email or settings.initial_user_password:
                raise RuntimeError(
                    "INITIAL_USER_EMAIL und INITIAL_USER_PASSWORD müssen beide gesetzt sein, oder keins von beiden."
                )
            else:
                print("WARNUNG: Kein Nutzer vorhanden, keine INITIAL_USER_* Variablen gesetzt. Login nicht möglich.")
    finally:
        db.close()

    yield


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    # dev-only: allow any localhost port, since the frontend's dev server
    # port shifts depending on what else is already running locally
    allow_origins=[settings.cors_origins],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(auth_router, prefix="/auth", tags=["auth"])
app.include_router(entries_router, prefix="/time_entries", tags=["time entries"])
app.include_router(contracts_router, prefix="/contracts", tags=["contracts"])
app.include_router(statistic_router)

@app.get("/")
async def root():
    return {"message": "Hello World"}

Base.metadata.create_all(bind=engine)