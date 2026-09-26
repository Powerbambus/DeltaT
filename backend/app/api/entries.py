from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.models.time_entry import TimeEntry
from app.schemas.time_entry import TimeEntryRead, TimeEntryWrite
from app.db.session import get_db

router = APIRouter()

@router.post("/", response_model=TimeEntryRead)
async def post_time_entry(request: TimeEntryWrite, db: Session = Depends(get_db)):
    duration = int((request.end_date - request.start_date).total_seconds())

    time_entry = TimeEntry(
        start_date = request.start_date,
        end_date = request.end_date,
        duration = duration,
        description = request.description
    )  

    try:
        db.add(time_entry)
        db.commit()

    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to create time entry")

    db.refresh(time_entry)

    return TimeEntryRead.model_validate(time_entry)

@router.get("/", response_model=list[TimeEntryRead])
async def get_time_entries(db: Session = Depends(get_db)):
    time_entries = db.query(TimeEntry).all()

    return [TimeEntryRead.model_validate(entry) for entry in time_entries]

@router.get("/{entry_id}", response_model=TimeEntryRead)
async def get_time_entry(entry_id: int, db: Session = Depends(get_db)):
    time_entry = db.query(TimeEntry).filter(
        TimeEntry.id == entry_id
    ).first()

    if time_entry is None:
        raise HTTPException(status_code=404, detail="TimeEntry not found")
    return TimeEntryRead.model_validate(time_entry)