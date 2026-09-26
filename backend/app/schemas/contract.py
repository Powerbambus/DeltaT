from pydantic import BaseModel, ConfigDict
from datetime import date

class ContractRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    start_date: date
    end_date: date | None
    weekly_hours: float | None
    description: str | None = None

class ContractBrief(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str

class ContractWrite(BaseModel):
    title: str
    start_date: date
    end_date: date | None
    weekly_hours: float | None
    description: str | None = None

class ContractUpdate(BaseModel):
    title: str | None = None
    start_date: date | None = None
    end_date: date | None = None
    weekly_hours: float | None = None
    description: str | None = None
    
class ContractDelete(BaseModel):
    delete_entries: bool = False