from pydantic import BaseModel

from datetime import date

class BalanceRead(BaseModel):
    target_hours: float
    actual_hours: float
    balance: float

class BalancePeriod(BaseModel):
    period_start: date
    period_end: date
    target_hours: float
    actual_hours: float
    period_balance: float
    target_met: bool
    cumulative_balance: float


class BalanceHistory(BaseModel):
    start_balance: float
    periods: list[BalancePeriod]