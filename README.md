# Helpdesk Ticket Management System — Phase 1

A full-stack web application for managing IT support tickets.

## Tech Stack

| Layer     | Technology          |
|-----------|---------------------|
| Frontend  | React 18 + Vite     |
| Backend   | Python FastAPI      |
| Database  | SQLite              |
| HTTP Client | Axios             |

---

## Project Structure

```
helpdesk/
├── backend/
│   ├── main.py           # FastAPI app entry point
│   ├── database.py       # SQLite + SQLAlchemy setup
│   ├── models.py         # ORM models
│   ├── schemas.py        # Pydantic validation schemas
│   ├── crud.py           # Database operations
│   ├── routers/
│   │   └── tickets.py    # Ticket CRUD routes
│   └── requirements.txt
└── frontend/
    └── src/
        ├── components/   # Navbar, StatusBadge, SearchFilter
        ├── pages/        # Dashboard, CreateTicket, TicketList, TicketDetail
        ├── services/     # ticketService.js (API calls)
        ├── App.jsx
        └── api.js        # Axios instance
```

---

## Setup & Run

### Backend

```bash
cd helpdesk/backend
pip install -r requirements.txt
uvicorn main:app --reload
```

API runs at: http://localhost:8000  
Interactive docs: http://localhost:8000/docs

### Frontend

```bash
cd helpdesk/frontend
npm install
npm run dev
```

App runs at: http://localhost:5173

---

## API Endpoints

| Method | Endpoint          | Description             |
|--------|-------------------|-------------------------|
| GET    | /tickets/         | List all tickets        |
| GET    | /tickets/{id}     | Get ticket by ID        |
| POST   | /tickets/         | Create new ticket       |
| PUT    | /tickets/{id}     | Update ticket           |
| DELETE | /tickets/{id}     | Delete ticket           |
| GET    | /search           | Search/filter tickets   |
| GET    | /stats            | Ticket count statistics |

### Search Parameters (GET /search)
- `keyword` — search in name, department, description
- `category` — filter by issue category
- `status` — filter by status
- `priority` — filter by priority

---

## Ticket Schema

| Field             | Type     | Notes                            |
|-------------------|----------|----------------------------------|
| ticket_id         | Integer  | Auto-generated                   |
| employee_name     | String   | Required                         |
| department        | String   | Required                         |
| issue_category    | String   | One of 7 categories              |
| description       | Text     | Required                         |
| priority          | String   | Low / Medium / High / Critical   |
| status            | String   | Open / In Progress / Resolved / Closed |
| resolution_notes  | Text     | Optional, added during resolution|
| created_at        | DateTime | Auto-set on creation             |

---

## Features

- **Dashboard** — ticket count by status, recent ticket list
- **Create Ticket** — form with client-side validation
- **Ticket List** — searchable, filterable table
- **Ticket Detail** — view full details, inline edit, delete
- **Search & Filter** — by keyword, category, status, priority
