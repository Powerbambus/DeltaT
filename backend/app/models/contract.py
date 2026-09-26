from sqlalchemy import DateTime, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime

from app.models.base import Base


class Contract(Base):
    __tablename__ = "contracts"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String)
    start_date: Mapped[datetime] = mapped_column(DateTime, default=datetime.now)
    end_date: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    weekly_hours: Mapped[float | None] = mapped_column(nullable=True)
    description: Mapped[str | None] = mapped_column(String, nullable=True)

    time_entries: Mapped[list["TimeEntry"]] = relationship(back_populates="contract")