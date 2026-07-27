# Architecture

## Overview

Tech-Hub is a multi-tenant SaaS application. Every business record
(customers, employees, projects, tasks, invoices, documents, notifications)
belongs to an `Organization`, and every API request is scoped to the
requesting user's `organizationId`. The first person to register creates a
new Organization and becomes its `ADMIN`; everyone else is invited into that
same tenant (role: `ADMIN`, `MANAGER`, or `EMPLOYEE`).

This shape was chosen deliberately over a single-tenant demo app: it's the
structural difference between "a CRUD app" and "a SaaS product," and it's the
one architectural decision that touches every table and every query.

## Monorepo layout

```
tech-hub/
├── api/index.ts              Vercel serverless entry (imports the Express app)
├── apps/
│   ├── api/src/               Express backend
│   │   ├── app.ts             express app wiring: helmet, cors, json, routes, errors
│   │   ├── server.ts          local dev entry (app.listen) — not used on Vercel
│   │   ├── config/env.ts      zod-validated environment variables
│   │   ├── lib/                prisma client, jwt helpers, error types, logger, pagination
│   │   ├── middleware/          auth, validation, error handling, rate limiting
│   │   └── modules/<name>/     routes.ts → controller.ts → service.ts per module
│   └── web/src/
│       ├── app/                 App.tsx, providers.tsx, router.tsx
│       ├── components/          shared UI (Button, Input, Table, Modal, ...) + layout
│       ├── features/<name>/     api.ts, hooks.ts, components/, pages/ per module
│       └── lib/                 axios instance, React Query client, token storage
├── packages/shared-types/src/   Zod request/response schemas + inferred TS types
└── prisma/schema.prisma         Single source of truth for the data model
```

`packages/shared-types` exists so the exact same Zod schema validates a
request on the server and types the request body on the client — no drift
between what the frontend sends and what the backend expects.

## Backend request flow

```
Router → validate(zodSchema) → requireAuth / requireRole → controller → service (Prisma) → JSON
```

- **`validate.middleware.ts`** parses `req.body` / `req.query` / `req.params`
  against a Zod schema and replaces them with the coerced, typed result. A
  failure short-circuits with a `400` and per-field messages.
- **`auth.middleware.ts`** verifies the JWT access token and attaches
  `{ sub, organizationId, role }` to `req.user`. `requireRole(...)` gates
  destructive or admin-only actions (e.g., only `ADMIN`/`MANAGER` can delete a
  customer; only `ADMIN` can delete an employee).
- **Services never trust a client-supplied `organizationId`.** Every service
  function takes `organizationId` from `req.user` (set by the JWT, not the
  request body) and filters every Prisma query by it — this is what makes the
  multi-tenancy actually hold.
- **`error.middleware.ts`** is the single place that turns thrown errors into
  HTTP responses: `AppError` instances map to their intended status code,
  known Prisma errors (`P2002` unique violation, `P2025` not found) map to
  `409`/`404`, and anything else becomes an opaque `500` — internal error
  detail is logged server-side but never leaked to the client.

## Frontend architecture

Each of the 12 modules is a **feature folder** with the same shape:

```
features/<module>/
  api.ts          axios calls, typed with the module's response shape
  hooks.ts        React Query hooks (useX, useCreateX, useUpdateX, useDeleteX)
  components/     module-specific components (e.g., form modals)
  pages/          the routed page component
```

Pages are built from the same shared component library
(`components/ui/*`: `Table`, `Modal`, `ConfirmDialog`, `Pagination`, `Badge`,
`Spinner`, `EmptyState`, `ErrorState`, `StatCard`, form inputs) so every list
page has the same loading / error / empty states, and every create/edit flow
is a modal form with the same validation and toast-on-success pattern.

`AuthProvider` + `ProtectedRoute` gate every route except `/login` and
`/register`. The shared Axios instance attaches the JWT on every request and,
on a `401`, transparently refreshes the access token once and retries — if
the refresh token is also invalid, it clears storage and redirects to
`/login`.

## Module depth: what's "deep" vs. "functional"

| Depth | Modules | What that means concretely |
|---|---|---|
| Deep | Auth, Dashboard, Customers, Employees, Projects, Tasks | Full CRUD, pagination + search + status filtering, role-based authorization, cross-entity referential checks (e.g. a task's `projectId`/`employeeId` must belong to the same org), automated tests |
| Functional | Finance, Notifications, Documents, AI Insights, Analytics, Settings | Same architecture and validation discipline, narrower feature surface (e.g. Documents stores a name/URL/tags rather than integrating real file storage) |

This split was a scope decision for a time-boxed assessment, not a technical
limitation — every "functional" module already follows the same
route → validate → controller → service → Prisma pattern and could be
extended without restructuring anything.

## Notable design decisions

- **AI Insights is a deterministic rules engine**, not a call to an external
  LLM API. It runs statistical checks over the org's own data — overdue-task
  ratio, revenue trend vs. last month, workload imbalance across employees,
  top customers by paid revenue, overdue invoices, active projects with no
  tasks — and returns severity-tagged insight cards. This was chosen so the
  module runs standalone with no external API key or cost, while staying a
  clean extension point: swap the rule functions in
  `apps/api/src/modules/ai-insights/ai-insights.service.ts` for a real LLM
  call later without touching the route or controller layer.
- **Refresh tokens are DB-backed and hashed**, not just long-lived JWTs. Each
  login/refresh issues a new refresh token, stores its SHA-256 hash in the
  `RefreshToken` table, and rotates (revokes the old one) on every refresh.
  This makes "log out everywhere" / token revocation possible, which a bare
  stateless JWT can't do.
- **Deployment target is a single Vercel project.** The Express app is
  exported as the default export of `api/index.ts`; Vercel's `@vercel/node`
  builder recognizes an Express app exported this way and wraps it as a
  serverless function automatically, so the same Express code runs
  identically in local dev (`node dist/server.js`) and on Vercel — no
  adapter layer, no rewrite of routes into individual serverless functions.

## Data model

See `prisma/schema.prisma` for the full schema. Summary:

- **Core**: `Organization`, `User` (role: `ADMIN` / `MANAGER` / `EMPLOYEE`), `RefreshToken`
- **Deep modules**: `Customer`, `Employee`, `Project`, `Task`
- **Functional modules**: `Invoice`, `Payment`, `Notification`, `Document`, `OrgSettings`

Every business table carries `organizationId` with an index on it (and on
common filter columns like `status`), and cascades on `Organization` deletion.
