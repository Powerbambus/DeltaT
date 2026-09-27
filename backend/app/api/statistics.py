from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from datetime import date

from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.statistic import BalanceRead, BalanceHistory, BalancePeriod
from app.services.statistic_service import calculate_target, calculate_actual, build_balance_history
from app.services.periods import months_ago, generate_monthly_periods, generate_weekly_periods
from app.db.session import get_db

router = APIRouter()

@router.get("/balance", response_model=BalanceRead)
async def get_balance(
    as_of: date | None = None,
    contract_id: int | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    as_of = as_of if as_of is not None else date.today()

    target = calculate_target(date.min, as_of, db, current_user.id, contract_id)
    actual = calculate_actual(date.min, as_of, db, current_user.id, contract_id)

    balance = actual - target

    balance_read = BalanceRead(target_hours=target, actual_hours=actual, balance=balance)

    return balance_read

@router.get("/balance/weekly", response_model=BalanceHistory)
async def get_weekly_balance(
    from_: date | None = Query(default=None, alias="from"),
    to: date | None = None,
    contract_id: int | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    to_resolved = to if to is not None else date.today()
    from_resolved = from_ if from_ is not None else months_ago(to_resolved, 6)

    return build_balance_history(generate_weekly_periods, from_resolved, to_resolved, contract_id, db, current_user.id)


@router.get("/balance/monthly", response_model=BalanceHistory)
async def get_monthly_balance(
    from_: date | None = Query(default=None, alias="from"),
    to: date | None = None,
    contract_id: int | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    to_resolved = to if to is not None else date.today()
    from_resolved = from_ if from_ is not None else months_ago(to_resolved, 6)

    return build_balance_history(generate_monthly_periods, from_resolved, to_resolved, contract_id, db, current_user.id)
