from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

REPORTING_DATABASE_URL = "sqlite:///./reporting.db"

reporting_engine = create_engine(
    REPORTING_DATABASE_URL, connect_args={"check_same_thread": False}
)
ReportingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=reporting_engine)
ReportingBase = declarative_base()


def get_reporting_db():
    db = ReportingSessionLocal()
    try:
        yield db
    finally:
        db.close()
