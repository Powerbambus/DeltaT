import calendar
from datetime import date, timedelta


def generate_weekly_periods(period_start: date, period_end: date) -> list[tuple[date, date]]:
    periods = []

    week_monday = period_start - timedelta(days=period_start.weekday())

    while week_monday <= period_end:
        week_sunday = week_monday + timedelta(days=6)

        clipped_start = max(week_monday, period_start)
        clipped_end = min(week_sunday, period_end)

        periods.append((clipped_start, clipped_end))

        week_monday += timedelta(days=7)

    return periods


def generate_monthly_periods(period_start: date, period_end: date) -> list[tuple[date, date]]:
    periods = []

    month_start = period_start.replace(day=1)

    while month_start <= period_end:
        if month_start.month == 12:
            next_month_start = month_start.replace(year=month_start.year + 1, month=1)
        else:
            next_month_start = month_start.replace(month=month_start.month + 1)

        month_end = next_month_start - timedelta(days=1)

        clipped_start = max(month_start, period_start)
        clipped_end = min(month_end, period_end)

        periods.append((clipped_start, clipped_end))

        month_start = next_month_start

    return periods

def months_ago(d: date, months: int) -> date:
    month = d.month - months
    year = d.year
    while month <= 0:
        month += 12
        year -= 1
    day = min(d.day, calendar.monthrange(year, month)[1])
    return date(year, month, day)