from sqlalchemy import Date, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import date

from app.models.base import Base


class Contract(Base):
    __tablename__ = "contracts"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String)
    start_date: Mapped[date] = mapped_column(Date, default=date.today)
    end_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    weekly_hours: Mapped[float | None] = mapped_column(nullable=True)
    description: Mapped[str | None] = mapped_column(String, nullable=True)

    time_entries: Mapped[list["TimeEntry"]] = relationship(back_populates="contract")