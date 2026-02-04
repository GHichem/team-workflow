# Team Workflow

This repository contains a small web app for managing requests and an audit log.

This README explains how to run the app locally, reset the database, and where to add screenshots that demonstrate the site UI.

**Quick Links**
- Init SQL: [api/sql/001_init.sql](api/sql/001_init.sql)
- Seed SQL: [api/sql/002_seed.sql](api/sql/002_seed.sql)

## Prerequisites
- Node.js (16+)
- PostgreSQL (or a running DB instance reachable from `DATABASE_URL`)
- `psql` CLI for running SQL files (or Docker + docker-compose if you use a containerized DB)

## Local dev
1. Install dependencies (in both root and `web/` / `api/` if needed):

```bash
# at repo root
npm install
# then, if desired, enter the web folder
cd web
npm install
```

2. Set `DATABASE_URL` to point at your Postgres instance. Example:

```bash
export DATABASE_URL="postgresql://postgres:password@localhost:5432/team_workflow"
# (Windows PowerShell)
$env:DATABASE_URL = "postgresql://postgres:password@localhost:5432/team_workflow"
```

3. Create / reset schema and load seed data (see DB section below).

4. Run the app (example for Next.js web front-end):

```bash
cd web
npm run dev
```

Open `http://localhost:3000` (or the port your app uses).

## Database: reset and seed
Choose one of these approaches depending on whether you want to fully recreate the schema or just wipe rows.

Option A — Full reset (drop & recreate schema)

```bash
# Drop and recreate the public schema, then run init + seed
psql "$DATABASE_URL" -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
psql "$DATABASE_URL" -f api/sql/001_init.sql
psql "$DATABASE_URL" -f api/sql/002_seed.sql
```

Option B — Truncate (keep schema, remove data)

```bash
psql "$DATABASE_URL" -c "TRUNCATE TABLE audit_logs, comments, requests, memberships, users, workspaces RESTART IDENTITY CASCADE;"
psql "$DATABASE_URL" -f api/sql/002_seed.sql
```

Notes:
- Always back up your DB before running destructive commands. Use `pg_dump` to export a backup:

```bash
pg_dump "$DATABASE_URL" > dump-before-reset.sql
```

## Where to put screenshots
Create a `docs/screenshots` directory at the repo root and add PNGs with descriptive names. This README already references the following placeholder files; replace them with real screenshots:

- `docs/screenshots/home.png` — Homepage / Requests list
- `docs/screenshots/audit-log.png` — Audit Log listing and filters
- `docs/screenshots/request-detail.png` — Request detail with comments

Add files with those names and the images will show inline here. Example Markdown to add a screenshot:

```md
![Audit Log](docs/screenshots/audit-log.png)
```

## Suggested screenshots and captions

- Home / Requests: shows request cards and top navigation.
- Audit Log: shows filters at top, table of logs, and the pagination controls (Previous / Page / Next aligned right).
- Request Detail: shows comments panel and preview panel if used.

If you want, I can create a `docs/screenshots/.gitkeep` placeholder file for you and commit it here so the folder exists; I can also prepare a short guide of recommended screenshot sizes (e.g. 1280×720) for consistent presentation.

## How to use the app (short)
- Browse requests from the main Requests page.
- Create a request using the request create form.
- View the Audit Log to see actions (filters at top, results table, pagination to the right).
- Seeded demo data is inserted by running [api/sql/002_seed.sql](api/sql/002_seed.sql).

## Where code lives
- Frontend (Next.js): `web/`
- Backend API: `api/`
- DB schema & seeds: `api/sql/` (see the two SQL files above)

---
If you want, I can also:
- Create the `docs/screenshots` folder and a `.gitkeep` file.
- Generate a richer `api/sql/002_seed.sql` with more realistic example data.
- Add a short gallery section in this README with captions (once you provide the screenshots or let me generate them).

Tell me which of the above you'd like next.
