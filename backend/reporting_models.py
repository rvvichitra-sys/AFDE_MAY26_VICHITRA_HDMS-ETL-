from sqlalchemy import Column, Integer, String, Float, DateTime
from reporting_db import ReportingBase


class ReportingTicket(ReportingBase):
    __tablename__ = "reporting_tickets"

    id = Column(Integer, primary_key=True, autoincrement=True)
    source_id = Column(String(50))
    employee_name = Column(String(100))
    department = Column(String(100))
    issue_category = Column(String(100))
    description = Column(String(1000))
    priority = Column(String(20))
    status = Column(String(20))
    created_date = Column(DateTime)
    resolved_date = Column(DateTime, nullable=True)
    resolution_days = Column(Float, nullable=True)
    etl_batch_id = Column(String(50))
