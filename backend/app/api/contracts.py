from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.models.contract import Contract
from app.schemas.contract import ContractRead, ContractWrite, ContractUpdate, ContractDelete
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

@router.patch("/{contract_id}", response_model=ContractRead)
async def update_contract(contract_id: int, request: ContractUpdate, db: Session = Depends(get_db)):
    old_contract = db.query(Contract).filter(
        Contract.id == contract_id
    ).first()

    if old_contract is None:
        raise HTTPException(status_code=404, detail=f"No contract with {contract_id} found!")

    old_contract.title = request.title if request.title is not None else old_contract.title
    old_contract.start_date = request.start_date if request.start_date is not None else old_contract.start_date
    old_contract.end_date = request.end_date if request.end_date is not None else old_contract.end_date
    old_contract.weekly_hours = request.weekly_hours if request.weekly_hours is not None else old_contract.weekly_hours
    old_contract.description = request.description if request.description is not None else old_contract.description

    db.commit()
    db.refresh(old_contract)
    return ContractRead.model_validate(old_contract)

@router.delete("/{contract_id}")
async def delete_contract(contract_id: int, delete_entries: bool = False, db: Session = Depends(get_db)):
    contract = db.query(Contract).filter(
        Contract.id == contract_id
    ).first()

    if contract is None:
        raise HTTPException(status_code=404, detail=f"No contract with {contract_id} found!")

    for entry in contract.time_entries:
        if not delete_entries:
            entry.contract_id = None 
        else:
            db.delete(entry)

    db.delete(contract)
    db.commit()

    return {"status": 200, "detail": f"Contract with id {contract_id} was successfully deleted."}
