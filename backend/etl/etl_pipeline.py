import csv
import hashlib
import uuid
from datetime import datetime
from reporting_db import ReportingSessionLocal, reporting_engine, ReportingBase
from reporting_models import ReportingTicket

ReportingBase.metadata.create_all(bind=reporting_engine)

CATEGORY_MAP = {
    "vpn issue": "VPN Issue", "vpn": "VPN Issue",
    "password reset": "Password Reset", "password": "Password Reset",
    "software installation": "Software Installation", "software": "Software Installation",
    "laptop issue": "Laptop Issue", "laptop": "Laptop Issue",
    "email access": "Email Access", "email": "Email Access",
    "network connectivity": "Network Connectivity", "network": "Network Connectivity", "connectivity": "Network Connectivity",
    "hardware request": "Hardware Request", "hardware": "Hardware Request",
}

PRIORITY_MAP = {
    "low": "Low", "l": "Low",
    "medium": "Medium", "med": "Medium", "m": "Medium", "normal": "Medium",
    "high": "High", "h": "High",
    "critical": "Critical", "urgent": "Critical", "crit": "Critical",
}

STATUS_MAP = {
    "open": "Open", "new": "Open", "pending": "Open",
    "in progress": "In Progress", "inprogress": "In Progress", "wip": "In Progress", "active": "In Progress",
    "resolved": "Resolved", "done": "Resolved", "fixed": "Resolved",
    "closed": "Closed", "complete": "Closed", "completed": "Closed",
}

VALID_CATEGORIES = set(CATEGORY_MAP.values())
VALID_PRIORITIES = set(PRIORITY_MAP.values())
VALID_STATUSES = set(STATUS_MAP.values())


def _normalize(value: str, mapping: dict, fallback: str) -> str:
    return mapping.get(value.lower().strip(), fallback)


def _parse_date(raw: str) -> datetime | None:
    if not raw or not raw.strip():
        return None
    for fmt in ("%Y-%m-%d", "%d/%m/%Y", "%m/%d/%Y", "%Y/%m/%d"):
        try:
            return datetime.strptime(raw.strip(), fmt)
        except ValueError:
            continue
    return None


def _fingerprint(employee: str, category: str, description: str) -> str:
    key = f"{employee.lower().strip()}|{category}|{description[:60].lower().strip()}"
    return hashlib.md5(key.encode()).hexdigest()


def run_etl(csv_path: str) -> dict:
    batch_id = str(uuid.uuid4())[:8]

    # --- Extract ---
    raw_rows = []
    with open(csv_path, newline="", encoding="utf-8") as f:
        for row in csv.DictReader(f):
            raw_rows.append(row)

    extracted = len(raw_rows)

    # --- Transform ---
    seen = set()
    transformed = []
    duplicates = 0
    invalid = 0

    for row in raw_rows:
        cat = _normalize(row.get("issue_category", ""), CATEGORY_MAP, "Hardware Request")
        pri = _normalize(row.get("priority", ""), PRIORITY_MAP, "Medium")
        sta = _normalize(row.get("status", ""), STATUS_MAP, "Open")
        emp = row.get("employee_name", "").strip().title()
        dept = row.get("department", "").strip().title()
        desc = row.get("description", "").strip()

        if not emp or not desc:
            invalid += 1
            continue

        created = _parse_date(row.get("created_date", "")) or datetime.utcnow()
        resolved = _parse_date(row.get("resolved_date", ""))

        res_days = None
        if resolved and resolved > created:
            res_days = (resolved - created).days

        fp = _fingerprint(emp, cat, desc)
        if fp in seen:
            duplicates += 1
            continue
        seen.add(fp)

        transformed.append(ReportingTicket(
            source_id=row.get("ticket_id", "").strip(),
            employee_name=emp,
            department=dept,
            issue_category=cat,
            description=desc,
            priority=pri,
            status=sta,
            created_date=created,
            resolved_date=resolved,
            resolution_days=res_days,
            etl_batch_id=batch_id,
        ))

    # --- Load ---
    db = ReportingSessionLocal()
    try:
        db.query(ReportingTicket).delete()
        db.bulk_save_objects(transformed)
        db.commit()
    finally:
        db.close()

    return {
        "batch_id": batch_id,
        "extracted": extracted,
        "duplicates_removed": duplicates,
        "invalid_skipped": invalid,
        "loaded": len(transformed),
        "status": "success",
    }
