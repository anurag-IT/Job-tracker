# Mini Job Application Tracker

A small full-stack CRUD app for tracking job applications. Built as an internship assessment — the goal is clean, complete, and correct over clever.

## Project overview

Track companies you've applied to, the role, status (Applied / Interviewing / Offer / Rejected), job type (Internship / Full-time / Part-time), applied date, and free-form notes. Filter by status, search by company or title, and edit or delete entries.

## Tech stack

| Layer       | Choice                                       |
| ----------- | -------------------------------------------- |
| Frontend    | Next.js 14 (App Router) + React 18 + TypeScript (strict) |
| Styling     | Tailwind CSS                                 |
| Backend     | Next.js API routes (REST)                    |
| Database    | PostgreSQL                                   |
| ORM         | Prisma 5 (with `prisma migrate`)             |
| Validation  | Zod (shared between client and server)       |
| Testing     | Vitest                                       |
| Container   | Docker + docker-compose                      |

## Prerequisites

- Node.js 20 or newer
- npm 10 or newer
- One of:
  - A local PostgreSQL 14+ instance, **or**
  - Docker + docker-compose (recommended — the compose file starts Postgres for you)

## Installation

```bash
# 1. Install dependencies
npm install

# 2. Copy the env template and edit DATABASE_URL if needed
cp .env.example .env

# 3. (Option A) Start a local Postgres via docker-compose
docker compose up -d db

# 4. Run Prisma migration to create the schema
npx prisma migrate dev --name init

# 5. Generate the Prisma client (migrate dev does this, but safe to re-run)
npx prisma generate
```

### Required environment variables

See [.env.example](.env.example). Only one variable is required:

| Variable       | Description                            | Example                                                                  |
| -------------- | -------------------------------------- | ------------------------------------------------------------------------ |
| `DATABASE_URL` | PostgreSQL connection string for Prisma | `postgresql://postgres:postgres@localhost:5433/job_tracker?schema=public` |

## Running

### Dev mode

```bash
npm run dev
```

Then visit <http://localhost:3000>.

### Running tests

```bash
npm run test          # one-shot
npm run test:watch    # watch mode
```

### Running with Docker (app + database)

```bash
docker compose up --build
```

The app container runs `prisma migrate deploy` on startup, so the schema is applied automatically. App is at <http://localhost:3000>, Postgres exposed on host port `5433` (mapped from container port `5432`).

## API documentation

All endpoints are JSON. Errors use the shape `{ "error": string, "details"?: object }`.

| Method | Path                        | Params                                                                 | Description                                                                  |
| ------ | --------------------------- | ---------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| GET    | `/api/applications`         | Query: `status?` (enum), `search?` (string — matches company or title) | List all applications, newest applied date first. `200`                      |
| GET    | `/api/applications/[id]`    | Path: `id`                                                             | Fetch one application. `200` / `404`                                         |
| POST   | `/api/applications`         | Body: JSON (see below)                                                 | Create an application. `201` / `400` on validation error                     |
| PATCH  | `/api/applications/[id]`    | Path: `id`. Body: JSON (partial)                                       | Partially update an application. `200` / `400` / `404`                       |
| DELETE | `/api/applications/[id]`    | Path: `id`                                                             | Delete an application. `204` / `404`                                         |

### Request body — POST `/api/applications`

```json
{
  "companyName": "Acme",
  "jobTitle": "Software Engineer Intern",
  "jobType": "INTERNSHIP",
  "status": "APPLIED",
  "appliedDate": "2026-06-01",
  "notes": "Referred by Alice."
}
```

Validation rules (Zod, shared with the client):

- `companyName`: required, ≥ 2 characters
- `jobTitle`: required
- `jobType`: `INTERNSHIP` | `FULL_TIME` | `PART_TIME`
- `status`: `APPLIED` | `INTERVIEWING` | `OFFER` | `REJECTED`
- `appliedDate`: required, ISO date string (e.g. `YYYY-MM-DD`)
- `notes`: optional, ≤ 5000 characters

### Sample response — `201 Created`

```json
{
  "id": "9b9c5b4f-1f3a-4a4f-8f6c-1a8b0e6e1234",
  "companyName": "Acme",
  "jobTitle": "Software Engineer Intern",
  "jobType": "INTERNSHIP",
  "status": "APPLIED",
  "appliedDate": "2026-06-01T00:00:00.000Z",
  "notes": "Referred by Alice.",
  "createdAt": "2026-06-17T10:15:00.000Z",
  "updatedAt": "2026-06-17T10:15:00.000Z"
}
```

### Sample validation error — `400 Bad Request`

```json
{
  "error": "Validation failed",
  "details": {
    "companyName": ["Company name must be at least 2 characters"]
  }
}
```

### Sample PATCH

```http
PATCH /api/applications/9b9c5b4f-1f3a-4a4f-8f6c-1a8b0e6e1234
Content-Type: application/json

{ "status": "INTERVIEWING" }
```

## Project structure

```
src/
  app/
    api/applications/
      route.ts            # GET (list) + POST (create)
      [id]/route.ts       # GET / PATCH / DELETE one
      stats/route.ts      # GET counts grouped by status
    [id]/
      page.tsx            # View detail
      edit/page.tsx       # Edit form
    new/page.tsx          # Create form
    page.tsx              # Home (stats + list)
    layout.tsx
    globals.css
    icon.svg              # Auto-served as favicon
    not-found.tsx
  components/
    ApplicationsList.tsx  # Client list with filter, debounced search, sort, optimistic delete
    ApplicationForm.tsx   # Shared create/edit form (Zod client-side)
    HomeView.tsx          # Wires StatsCards + ApplicationsList together
    StatsCards.tsx        # Dashboard count cards
    Toast.tsx             # Success/error toast (sessionStorage + DOM event)
    StatusBadge.tsx
    ConfirmDialog.tsx
    Spinner.tsx
  lib/
    prisma.ts             # Singleton PrismaClient
    validation.ts         # Shared Zod schemas
    types.ts
    labels.ts
    format.ts
    http.ts               # JSON error helpers
    validation.test.ts    # Vitest unit tests
prisma/
  schema.prisma
```

## Features

- Responsive table on desktop, cards on mobile
- Dashboard stat cards (Total + per-status counts) on the home page
- Status filter tabs + debounced search (300 ms)
- Click-to-sort on Company and Applied-date columns
- Add / Edit / View / Delete with confirmation dialog
- Optimistic delete (reverts on failure)
- Success / error toast notifications on create, edit, and delete
- Loading and error states on every fetch
- Empty state when no applications match
- TypeScript strict mode, no `any`
- Shared Zod validation on client and server

## Screenshots

### Application list (desktop)

Responsive table with dashboard stat cards, status filter tabs, search, and sortable columns.

![Application list on desktop](docs/screenshots/list-desktop.jpg)

### Application list (mobile)

The same data collapses into stacked cards on small screens.

![Application list on mobile](docs/screenshots/list-mobile.jpg)

### Add / edit application form

Shared form for creating and editing, with client-side validation.

![Add application form](docs/screenshots/form.jpg)

### Application detail

Read-only view of a single application, including notes.

![Application detail](docs/screenshots/detail.jpg)

### Filter by status

Filtering the list down to a single status.

![List filtered by status](docs/screenshots/filter.jpg)
