from sqlalchemy import DateTime, String
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime

from app.models.base import Base


class TimeEntry(Base):
    __tablename__ = "time_entries"

    id: Mapped[int] = mapped_column(primary_key=True)
    start_date: Mapped[datetime] = mapped_column(DateTime, default=datetime.now)
    end_date: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    duration: Mapped[int | None] = mapped_column(nullable=True)
    description: Mapped[str | None] = mapped_column(String, nullable=True)
