from fastapi import FastAPI, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
from database import engine, get_db
import models
import crud
from schemas import TicketResponse
from routers import tickets
from routers import analytics
from reporting_db import reporting_engine, ReportingBase
from reporting_models import ReportingTicket  # noqa: F401 — ensures table is registered

models.Base.metadata.create_all(bind=engine)
ReportingBase.metadata.create_all(bind=reporting_engine)

app = FastAPI(
    title="Helpdesk Ticket Management System",
    description="REST API for managing IT support tickets",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(tickets.router)
app.include_router(analytics.router)


@app.get("/search", response_model=List[TicketResponse], tags=["search"])
def search_tickets(
    keyword: Optional[str] = Query(None, description="Search in description, name, department"),
    category: Optional[str] = Query(None, description="Filter by issue category"),
    status: Optional[str] = Query(None, description="Filter by status"),
    priority: Optional[str] = Query(None, description="Filter by priority"),
    db: Session = Depends(get_db),
):
    return crud.search_tickets(db, keyword=keyword, category=category, status=status, priority=priority)


@app.get("/stats", tags=["stats"])
def get_stats(db: Session = Depends(get_db)):
    return crud.get_stats(db)


@app.get("/", tags=["root"])
def root():
    return {"message": "Helpdesk Ticket Management System API", "docs": "/docs"}
