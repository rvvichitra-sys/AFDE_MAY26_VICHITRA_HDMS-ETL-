import os
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from reporting_db import get_reporting_db
from reporting_models import ReportingTicket

router = APIRouter(prefix="/analytics", tags=["analytics"])

CSV_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "historical_tickets.csv")


@router.post("/etl/run")
def run_etl_pipeline():
    from etl.etl_pipeline import run_etl
    if not os.path.exists(CSV_PATH):
        raise HTTPException(status_code=404, detail="Dataset CSV not found at data/historical_tickets.csv")
    return run_etl(CSV_PATH)


@router.get("/summary")
def analytics_summary(db: Session = Depends(get_reporting_db)):
    total = db.query(func.count(ReportingTicket.id)).scalar() or 0
    resolved = (
        db.query(func.count(ReportingTicket.id))
        .filter(ReportingTicket.status.in_(["Resolved", "Closed"]))
        .scalar() or 0
    )
    avg_res = (
        db.query(func.avg(ReportingTicket.resolution_days))
        .filter(ReportingTicket.resolution_days.isnot(None))
        .scalar()
    )
    open_count = (
        db.query(func.count(ReportingTicket.id))
        .filter(ReportingTicket.status.in_(["Open", "In Progress"]))
        .scalar() or 0
    )
    return {
        "total_historical": total,
        "resolved": resolved,
        "open_in_progress": open_count,
        "avg_resolution_days": round(float(avg_res), 1) if avg_res else None,
    }


@router.get("/category-distribution")
def category_distribution(db: Session = Depends(get_reporting_db)):
    rows = (
        db.query(ReportingTicket.issue_category, func.count(ReportingTicket.id).label("count"))
        .group_by(ReportingTicket.issue_category)
        .order_by(func.count(ReportingTicket.id).desc())
        .all()
    )
    return [{"category": r[0], "count": r[1]} for r in rows]


@router.get("/priority-distribution")
def priority_distribution(db: Session = Depends(get_reporting_db)):
    order = {"Critical": 0, "High": 1, "Medium": 2, "Low": 3}
    rows = (
        db.query(ReportingTicket.priority, func.count(ReportingTicket.id).label("count"))
        .group_by(ReportingTicket.priority)
        .all()
    )
    result = [{"priority": r[0], "count": r[1]} for r in rows]
    result.sort(key=lambda x: order.get(x["priority"], 99))
    return result


@router.get("/department-stats")
def department_stats(db: Session = Depends(get_reporting_db)):
    rows = (
        db.query(ReportingTicket.department, func.count(ReportingTicket.id).label("count"))
        .group_by(ReportingTicket.department)
        .order_by(func.count(ReportingTicket.id).desc())
        .all()
    )
    return [{"department": r[0], "count": r[1]} for r in rows]


@router.get("/resolution-trends")
def resolution_trends(db: Session = Depends(get_reporting_db)):
    rows = (
        db.query(
            func.strftime("%Y-%m", ReportingTicket.created_date).label("month"),
            func.avg(ReportingTicket.resolution_days).label("avg_days"),
            func.count(ReportingTicket.id).label("total"),
        )
        .filter(ReportingTicket.resolution_days.isnot(None))
        .group_by(func.strftime("%Y-%m", ReportingTicket.created_date))
        .order_by(func.strftime("%Y-%m", ReportingTicket.created_date))
        .all()
    )
    return [
        {"month": r[0], "avg_days": round(float(r[1]), 1) if r[1] else 0, "total_resolved": r[2]}
        for r in rows
    ]


@router.get("/status-breakdown")
def status_breakdown(db: Session = Depends(get_reporting_db)):
    rows = (
        db.query(ReportingTicket.status, func.count(ReportingTicket.id).label("count"))
        .group_by(ReportingTicket.status)
        .all()
    )
    return [{"status": r[0], "count": r[1]} for r in rows]
