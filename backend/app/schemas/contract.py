from pydantic import BaseModel, ConfigDict
from datetime import datetime

class ContractRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    start_date: datetime
    end_date: datetime | None
    weekly_hours: float | None
    description: str | None = None

class ContractBrief(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str

class ContractWrite(BaseModel):
    title: str
    start_date: datetime
    end_date: datetime | None
    weekly_hours: float | None
    description: str | None = None