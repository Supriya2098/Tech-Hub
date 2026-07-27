# Tech-Hub — Business Operating System

A production-shaped, multi-tenant SaaS platform for running a small business:
customers, employees, projects, tasks, finance, documents, notifications,
analytics, and AI-generated operational insights — all in one place.

Built as a technical assessment project. Every layer (schema, API, UI, CI/CD,
deployment) is real and runnable, not a mockup.

## Tech stack

| Layer | Choice |
|---|---|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS, React Router, TanStack Query, Axios, Recharts |
| Backend | Node.js, Express, TypeScript, Zod validation |
| Database | PostgreSQL (Neon) via Prisma ORM |
| Auth | JWT access + refresh tokens, bcrypt password hashing, role-based access control |
| CI/CD | GitHub Actions (lint, typecheck, test, build → migrate → deploy) |
| Hosting | Vercel (static frontend + Express API as a serverless function) |

## Modules

Auth · Dashboard · Customer Management · Employee Management · Project Management ·
Task Management · Finance (invoices & payments) · Notifications · Documents ·
AI Insights · Analytics · Settings

Auth, Dashboard, Customers, Employees, Projects, and Tasks are built to full
production depth (pagination, search/filtering, role-based authorization,
tests). Finance, Notifications, Documents, AI Insights, Analytics, and Settings
share the same architecture and are intentionally leaner in scope — see
[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the reasoning.

## Repository layout

```
apps/api      Express + TypeScript backend
apps/web      React + Vite frontend
api/          Vercel serverless entry point (wraps the Express app)
packages/shared-types   Zod schemas + inferred types shared by both apps
prisma/       Database schema
docs/         Architecture, API reference, setup, and deployment guides
.github/workflows   CI and CD pipelines
```

## Quick start

See [docs/SETUP.md](docs/SETUP.md) for full local development instructions
(Node version, environment variables, database, running both apps). In short:

```bash
npm install
cp .env.example .env && cp .env.example apps/api/.env && cp .env.example apps/web/.env
# fill in DATABASE_URL / DIRECT_URL / JWT secrets in each
npx prisma migrate dev
npm run prisma:seed          # optional: load a realistic demo dataset
npm run dev:api               # http://localhost:4000
npm run dev:web               # http://localhost:5173 (separate terminal)
```

After seeding, sign in at `http://localhost:5173` with **admin@techhub.in /
TechHub@123** to see a fully populated dashboard (customers, employees,
projects, tasks, invoices, AI insights) for a fictional Indian IT services
company, Tech-Hub Solutions Pvt. Ltd. A light/dark theme toggle sits in the
top bar (and on the login page).

## Scripts (run from the repo root)

| Command | What it does |
|---|---|
| `npm run dev:api` / `npm run dev:web` | Run each app in dev mode |
| `npm run build` | Build shared-types, then the API, then the web app |
| `npm run typecheck` | Typecheck every workspace |
| `npm run lint` | Lint the API and web workspaces |
| `npm run test` | Run the backend and frontend test suites |
| `npm run prisma:migrate` | Create/apply a local dev migration |
| `npm run prisma:studio` | Open Prisma Studio |
| `npm run prisma:seed` | Reset the DB and load the Tech-Hub demo dataset |

## Documentation

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — design decisions, folder structure, data model
- [docs/API.md](docs/API.md) — full REST endpoint reference
- [docs/SETUP.md](docs/SETUP.md) — local development setup
- [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) — CI/CD pipeline, Vercel + Neon deployment

  
 Trigger deployment at 8:25 PM
