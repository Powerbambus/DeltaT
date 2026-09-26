from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.models.contract import Contract
from app.schemas.contract import ContractRead, ContractWrite
from app.db.session import get_db

router = APIRouter()

@router.get("/", response_model=list[ContractRead])
async def get_contracts(db: Session = Depends(get_db)):
    contracts = db.query(Contract).all()

    return [ContractRead.model_validate(contract) for contract in contracts]

@router.get("/{contract_id}", response_model=ContractRead)
async def get_contract(contract_id: int, db: Session = Depends(get_db)):
    contract = db.query(Contract).filter(
        Contract.id == contract_id
    ).first()

    if contract is None:
        raise HTTPException(status_code=404, detail="Contract not found")
    return ContractRead.model_validate(contract)

@router.post("/", response_model=ContractRead)
async def post_contract(request: ContractWrite, db: Session = Depends(get_db)):
    contract = Contract(
        title = request.title,
        start_date = request.start_date,
        end_date = request.end_date,
        weekly_hours = request.weekly_hours,
        description = request.description
    )  

    try:
        db.add(contract)
        db.commit()

    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to create contract")

    db.refresh(contract)

    return ContractRead.model_validate(contract)