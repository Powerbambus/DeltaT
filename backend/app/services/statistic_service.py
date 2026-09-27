from datetime import date, datetime, timedelta, time
from sqlalchemy.orm import Session
from sqlalchemy import func
from fastapi import HTTPException, Query

from app.models.contract import Contract
from app.models.time_entry import TimeEntry
from app.services.periods import months_ago
from app.schemas.statistic import BalancePeriod, BalanceHistory

def calculate_overlap(contract: Contract, period_start: date, period_end: date):
    contract_start = contract.start_date
    contract_end = contract.end_date

    later_start = max(contract_start, period_start)
    earlier_end = min(contract_end, period_end) if contract_end is not None else period_end

    overlap = (earlier_end - later_start).days + 1 # Off-by-One Correction

    if overlap < 0:
        return 0

    return overlap

def calculate_target(period_start: date, period_end: date, db: Session, user_id: int, contract_id: int | None = None):
    def calculate_contract_hours(contract: Contract, period_start: date, period_end: date):
        overlap = calculate_overlap(contract, period_start, period_end)

        hours = contract.weekly_hours / 7 * overlap

        return hours

    if contract_id is not None:
        contract = db.query(Contract).filter(
            Contract.id == contract_id,
            Contract.user_id == user_id,
        ).first()
        if contract is None:
            raise HTTPException(status_code=404, detail=f"Contract {contract_id} not found.")

        return calculate_contract_hours(contract, period_start, period_end)

    else:
        contracts = db.query(Contract).filter(Contract.user_id == user_id).all()

        if len(contracts) == 0:
            return 0

        total_hours = 0

        for contract in contracts:
            total_hours += calculate_contract_hours(contract, period_start, period_end)

        return total_hours

def calculate_actual(period_start: date, period_end: date, db: Session, user_id: int, contract_id: int | None = None):
    period_start_datetime = datetime.combine(period_start, time(0, 0))
    period_end_datetime = datetime.combine(period_end + timedelta(days=1), time(0, 0))

    query = db.query(func.sum(TimeEntry.duration)).filter(
        TimeEntry.user_id == user_id,
        TimeEntry.start_date >= period_start_datetime,
        TimeEntry.start_date < period_end_datetime,
    )

    if contract_id is not None:
        query = query.filter(TimeEntry.contract_id == contract_id)

    result = query.scalar()

    if result is None:
        return 0
    return result/3600

def build_balance_history(
    period_generator,
    from_date: date,
    to_date: date,
    contract_id: int | None,
    db: Session,
    user_id: int,
) -> BalanceHistory:
    day_before = from_date - timedelta(days=1)
    start_actual = calculate_actual(date.min, day_before, db, user_id, contract_id)
    start_target = calculate_target(date.min, day_before, db, user_id, contract_id)
    running_balance = start_actual - start_target

    periods = []
    for p_start, p_end in period_generator(from_date, to_date):
        target = calculate_target(p_start, p_end, db, user_id, contract_id)
        actual = calculate_actual(p_start, p_end, db, user_id, contract_id)
        period_balance = actual - target
        running_balance += period_balance

        periods.append(BalancePeriod(
            period_start=p_start,
            period_end=p_end,
            target_hours=target,
            actual_hours=actual,
            period_balance=period_balance,
            target_met=period_balance >= 0,
            cumulative_balance=running_balance,
        ))

    return BalanceHistory(start_balance=start_actual - start_target, periods=periods)