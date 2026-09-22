# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

LoeiTech Admission System — a monorepo web application for managing student admissions at Loei Technical College. The system handles application submission, status tracking, enrollment confirmation, and admin management.

## Architecture

**Monorepo** with three main packages:
- `frontend/` — Vue 3 + Vite + TypeScript SPA served via Nginx
- `backend/` — Node.js + Express + TypeScript REST API
- `database/` — PostgreSQL schema and migration SQL files

**Frontend → Backend flow:**
- Frontend calls `VITE_API_URL` (Axios, 10s timeout) defined in `.env`
- In Docker, Nginx proxies `/api/*` to `http://backend:3001` (see `frontend/nginx.conf`)
- In dev, Axios directly calls `http://localhost:13001`

**API structure** (all under `/api`):
- `/health` — health check
- `/applications` — public: submit application, check status, get stats, get curriculums/divisions/expenses/admission-plan
- `/enrollments` — enrollment confirmation and status
- `/admin` — CRUD for users, curriculums, divisions, admission plans, expenses, applicants; login at `/api/admin/login`
- `/auth` — router stub (currently empty)

> **Note:** Admin routes currently have **no JWT middleware guard** — the `backend/src/middleware/auth.ts` file exists but is not applied to any router.

**Database schema** (`database/schema.sql`):
- `applicants` — main application records (UUID PK, 13-digit Thai ID card, status enum: `pending_payment/paid/enrolled`)
- `documents` — uploaded file metadata linked to `applicants` via `app_id` (fields: `file_name`, `doc_type`, `uploaded_at`)
- `users` — staff/admin accounts (role: `admin/staff`)
- `curriculums` — educational programs (ปวช./ปวส.)
- `divisions` — branches per curriculum
- `admission_plan` — enrollment quotas per year/curriculum/division
- `expense_detail` — program costs with `payment_type` enum (`mandatory/optional/custom`)

Application creation uses DB transactions for atomicity. Remaining seats are calculated via `COUNT()` of enrolled applicants against `plan_num`.

## Development Commands

### Backend (`cd backend`)
```bash
npm install
cp .env.example .env   # Set DATABASE_URL, JWT_SECRET, PORT=13001
npm run dev            # ts-node, port 13001
npm run dev:watch      # nodemon auto-reload
npm run build          # Compile TS → dist/
npm start              # Production (node dist/index.js)
```

### Frontend (`cd frontend`)
```bash
npm install
npm run dev            # Vite dev server, port 13000
npm run build          # Production build
npm run type-check     # vue-tsc --build
npm run lint           # oxlint + eslint --fix --cache
npm run format         # Prettier
```

### Docker
```bash
docker-compose up -d   # Start frontend + backend
docker-compose down
```

## Key Environment Variables

**Backend** (`.env` / `.env.example`):
- `DATABASE_URL` — PostgreSQL connection string (e.g., `postgresql://user:pass@host:port/db`)
- `JWT_SECRET` — auth secret
- `PORT` — default `13001` locally, `3001/3002` in Docker prod/test
- `DB_SSL` — set `false` for local dev
- `FRONTEND_URL` — CORS allowed origin

**Frontend** (`.env` / `.env.example`):
- `VITE_API_URL` — API base URL (e.g., `http://localhost:13001`)

## Port Reference

| Service | Local Dev | Docker Test | Docker Prod |
|---------|-----------|-------------|-------------|
| Frontend | 13000 | 5174 | 5173 |
| Backend | 13001 | 3002 | 3001 |

## Frontend HTTP Clients

Two HTTP client files coexist — prefer `httpClient.ts` for new code:
- `frontend/src/services/httpClient.ts` — Axios instance with `VITE_API_URL` base URL
- `frontend/src/services/api.ts` — older fetch-based wrapper with the same base URL

The auth store (`stores/auth.ts`) only persists an `isAuthenticated` boolean in localStorage. The JWT token returned by `/api/admin/login` must be stored separately (e.g., in `localStorage`) and sent as `Authorization: Bearer <token>` for protected endpoints.

## Frontend Routes

Public routes: `/`, `/register`, `/check-status`, `/enrollment`, `/enrollment/:idCard`, `/guide`
Admin routes (no client-side guards): `/login`, `/admin/users`, `/admin/manage-users`, `/admin/settings`, `/admin/expenses`, `/admin/onsite-enrollment`

## File Uploads

Multer middleware (`backend/src/middleware/upload.ts`) handles:
- Fields: `id_front`, `id_back`, `edu_front`, `edu_back`
- Formats: JPG, PNG, PDF — max 10MB per file
- Storage: local disk in `backend/uploads/`

The `/uploads` route in `backend/src/index.ts` has fallback logic that queries the `documents` table to resolve mismatched filenames (Thai characters cause encoding issues).

## Response Format

All API responses use helpers from `backend/src/utils/response.ts`:
```json
{ "success": true, "message": "...", "data": { ... } }
```

## CI/CD

GitHub Actions deploys to a private Docker registry (`registry.loeitech.org`):
- Push to `test` branch → test stack (subdomain: `test-admission.loeitech.ac.th`)
- Push to `prod` branch → prod stack (subdomain: `admission.loeitech.ac.th`)

See `CONFIG_GUIDE.md` for full environment matrix and required GitHub secrets.

## Database Migrations

Schema changes are applied manually via SQL files in `database/`. There is no migration framework — run files directly against PostgreSQL in order:
1. `schema.sql` — full schema setup
2. `add_payment_type.sql` — add `payment_type` enum to `expense_detail`
3. `add_prev_branch_field.sql` — add `prev_branch` (int, nullable) to `applicants` for PVC graduates
