from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.models.contract import Contract
from app.models.time_entry import TimeEntry
from app.models.user import User
from app.schemas.time_entry import TimeEntryRead, TimeEntryWrite, TimeEntryUpdate
from app.db.session import get_db

router = APIRouter()

def _get_owned_contract_id(contract_id: int | None, db: Session, current_user: User) -> int | None:
    if contract_id is None:
        return None

    contract = db.query(Contract).filter(
        Contract.id == contract_id,
        Contract.user_id == current_user.id,
    ).first()

    if contract is None:
        raise HTTPException(status_code=404, detail=f"No contract with {contract_id} found!")

    return contract.id

@router.get("/", response_model=list[TimeEntryRead])
async def get_time_entries(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    time_entries = db.query(TimeEntry).filter(TimeEntry.user_id == current_user.id).all()

    return [TimeEntryRead.model_validate(entry) for entry in time_entries]

@router.get("/{entry_id}", response_model=TimeEntryRead)
async def get_time_entry(entry_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    time_entry = db.query(TimeEntry).filter(
        TimeEntry.id == entry_id,
        TimeEntry.user_id == current_user.id,
    ).first()

    if time_entry is None:
        raise HTTPException(status_code=404, detail="TimeEntry not found")
    return TimeEntryRead.model_validate(time_entry)

@router.post("/", response_model=TimeEntryRead)
async def post_time_entry(request: TimeEntryWrite, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    duration = int((request.end_date - request.start_date).total_seconds())
    contract_id = _get_owned_contract_id(request.contract_id, db, current_user)

    time_entry = TimeEntry(
        start_date = request.start_date,
        end_date = request.end_date,
        duration = duration,
        description = request.description,
        contract_id = contract_id,
        user_id = current_user.id,
    )

    try:
        db.add(time_entry)
        db.commit()

    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to create time entry")

    db.refresh(time_entry)

    return TimeEntryRead.model_validate(time_entry)

@router.patch("/{entry_id}", response_model=TimeEntryRead)
async def update_time_entry(entry_id: int, request: TimeEntryUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    old_entry = db.query(TimeEntry).filter(
        TimeEntry.id == entry_id,
        TimeEntry.user_id == current_user.id,
    ).first()

    if old_entry is None:
        raise HTTPException(status_code=404, detail=f"No entry with {entry_id} found!")

    old_entry.start_date = request.start_date if request.start_date is not None else old_entry.start_date
    old_entry.end_date = request.end_date if request.end_date is not None else old_entry.end_date
    if old_entry.end_date is not None:
        old_entry.duration = int((old_entry.end_date - old_entry.start_date).total_seconds())

    old_entry.description = request.description if request.description is not None else old_entry.description

    if request.contract_id is not None:
        old_entry.contract_id = _get_owned_contract_id(request.contract_id, db, current_user)

    db.commit()
    db.refresh(old_entry)
    return TimeEntryRead.model_validate(old_entry)

@router.delete("/{entry_id}")
async def delete_time_entry(entry_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    entry = db.query(TimeEntry).filter(
        TimeEntry.id == entry_id,
        TimeEntry.user_id == current_user.id,
    ).first()

    if entry is None:
        raise HTTPException(status_code=404, detail=f"No entry with {entry_id} found!")

    db.delete(entry)
    db.commit()

    return {"status": 200, "detail": f"Time entry with id {entry_id} was successfully deleted."}
