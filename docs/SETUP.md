# Local Setup

## Prerequisites

- Node.js 20+ and npm 10+
- A PostgreSQL database — the project targets [Neon](https://neon.tech) (serverless
  Postgres, free tier), but any Postgres 14+ instance works for local dev

## 1. Install dependencies

From the repo root (this installs all three workspaces — `apps/api`, `apps/web`,
`packages/shared-types` — via npm workspaces):

```bash
npm install
```

## 2. Configure environment variables

Because this is an npm-workspaces monorepo, each tool loads its own `.env`
from **its own working directory** — one root-level copy is not enough:

```bash
cp .env.example .env               # used by the Prisma CLI (migrate/studio/seed) run from the repo root
cp .env.example apps/api/.env      # used by the API at runtime (dotenv/config resolves relative to apps/api)
cp .env.example apps/web/.env      # only VITE_API_BASE_URL is read here by Vite
```

All three can start as identical copies of `.env.example` — Vite and Prisma
simply ignore the variables that aren't relevant to them.

Fill in:

| Variable | Where it's used | Notes |
|---|---|---|
| `DATABASE_URL` | Prisma runtime queries | Use Neon's **pooled** connection string (`-pooler` in the host); for local Postgres just use your normal connection string |
| `DIRECT_URL` | Prisma Migrate | Use Neon's **direct** connection string (no pooler) |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | API | Any long random string — generate with `openssl rand -hex 32` |
| `CORS_ORIGIN` | API | `http://localhost:5173` for local dev |
| `VITE_API_BASE_URL` | Frontend | `http://localhost:4000/api` for local dev |

If you don't have a Neon account yet: create a project at neon.tech, copy the
"pooled connection" string into `DATABASE_URL` and the "direct connection"
string into `DIRECT_URL`. Don't have Postgres at all? The quickest local
option is Docker: `docker run -d --name techhub-postgres -e POSTGRES_USER=techhub -e POSTGRES_PASSWORD=techhub -e POSTGRES_DB=techhub -p 55432:5432 postgres:16-alpine`,
then point `DATABASE_URL`/`DIRECT_URL` at
`postgresql://techhub:techhub@localhost:55432/techhub?schema=public`.

## 3. Set up the database

```bash
npx prisma generate     # generate the Prisma client
npx prisma migrate dev  # create the schema and apply migrations
```

`prisma migrate dev` will prompt for a migration name the first time — any
name works (e.g. `init`).

### Optional: load realistic demo data

`prisma/seed.ts` resets the database and loads one fully populated tenant —
**Tech-Hub Solutions Pvt. Ltd.**, a fictional Indian IT services company —
with 17 employees, 10 customers, 10 projects, ~60 tasks, invoices/payments
spanning 6 months, documents, and notifications. It's shaped so every
dashboard/analytics/AI-insights view has something real to show instead of
empty states.

```bash
npm run prisma:seed
```

Login after seeding: **admin@techhub.in / TechHub@123**

This is destructive (it wipes all existing rows first) — only run it against
a dev/demo database, never production.

## 4. Run the apps

In two terminals:

```bash
npm run dev:api    # Express API on http://localhost:4000
npm run dev:web    # Vite dev server on http://localhost:5173
```

Open `http://localhost:5173`, register an organization, and start using the
app. The first registered user becomes that organization's `ADMIN`.

## Useful commands

```bash
npm run build        # build shared-types, then the API, then the web app
npm run typecheck    # typecheck every workspace
npm run lint         # lint the API and web workspaces
npm run test         # run backend (Vitest) and frontend (Vitest + Testing Library) tests
npm run prisma:studio  # open Prisma Studio to browse/edit data
npm run prisma:seed    # reset the DB and load the Tech-Hub demo dataset
```

## Troubleshooting

- **`Invalid environment variables` on API start** — one of the required vars
  in `apps/api/src/config/env.ts` is missing or too short; check `.env`.
- **Prisma can't reach the database** — Neon databases auto-suspend when idle;
  the first query after a pause takes a moment to wake it up, this is normal.
- **CORS errors in the browser** — make sure `CORS_ORIGIN` in the API's `.env`
  matches the URL the frontend is actually served from.
