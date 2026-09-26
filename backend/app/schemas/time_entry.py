from pydantic import BaseModel, ConfigDict
from datetime import datetime

class TimeEntryRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    start_date: datetime
    end_date: datetime
    duration: int
    description: str | None = None

class TimeEntryWrite(BaseModel):
    start_date: datetime
    end_date: datetime
    description: str | None = None