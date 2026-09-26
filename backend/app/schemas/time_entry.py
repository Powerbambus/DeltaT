from pydantic import BaseModel, ConfigDict
from datetime import datetime

from app.schemas.contract import ContractBrief

class TimeEntryRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    start_date: datetime
    end_date: datetime
    duration: int
    description: str | None = None

    contract: ContractBrief | None = None

class TimeEntryWrite(BaseModel):
    start_date: datetime
    end_date: datetime
    description: str | None = None

    contract_id: int | None = None

class TimeEntryUpdate(BaseModel):
    start_date: datetime | None = None
    end_date: datetime | None = None
    description: str | None = None

    contract_id: int | None = None