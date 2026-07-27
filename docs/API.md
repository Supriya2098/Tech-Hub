# API Reference

Base URL: `{API_BASE_URL}/api` (local dev: `http://localhost:4000/api`).

All responses are JSON. Successful responses have the shape
`{ "data": ... }` (list endpoints add `"meta": { page, limit, total, totalPages }`).
Errors have the shape `{ "error": { "message", "code", "fieldErrors"? } }`.

All routes except `/auth/register`, `/auth/login`, and `/auth/refresh` require
an `Authorization: Bearer <accessToken>` header. Routes marked **RBAC** also
require the caller's role to be one of the listed roles.

## Auth

| Method | Path | Auth | Body | Notes |
|---|---|---|---|---|
| POST | `/auth/register` | none | `{ organizationName, name, email, password }` | Creates a new Organization + an `ADMIN` user. Rate-limited. |
| POST | `/auth/login` | none | `{ email, password }` | Rate-limited. |
| POST | `/auth/refresh` | none | `{ refreshToken }` | Rotates the refresh token; returns a new token pair. |
| POST | `/auth/logout` | none | `{ refreshToken }` | Revokes the given refresh token. |
| GET | `/auth/me` | required | — | Returns the current user + organization. |

## Dashboard

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/dashboard/summary` | required | Stats (customers, active projects, open/overdue tasks, active employees, revenue this/last month), 5 upcoming tasks, 5 recent notifications. |

## Customers

| Method | Path | Auth | Query / Body |
|---|---|---|---|
| GET | `/customers` | required | `page, limit, search, status` |
| GET | `/customers/:id` | required | — |
| POST | `/customers` | required | `{ name, email?, phone?, company?, status?, notes? }` |
| PATCH | `/customers/:id` | required | partial of the above |
| DELETE | `/customers/:id` | **RBAC** `ADMIN, MANAGER` | — |

## Employees

| Method | Path | Auth | Query / Body |
|---|---|---|---|
| GET | `/employees` | required | `page, limit, search, status, department` |
| GET | `/employees/:id` | required | — |
| POST | `/employees` | **RBAC** `ADMIN, MANAGER` | `{ name, email, department?, title?, status?, salary?, hiredAt? }` |
| PATCH | `/employees/:id` | **RBAC** `ADMIN, MANAGER` | partial of the above |
| DELETE | `/employees/:id` | **RBAC** `ADMIN` | — |

## Projects

| Method | Path | Auth | Query / Body |
|---|---|---|---|
| GET | `/projects` | required | `page, limit, search, status, customerId` |
| GET | `/projects/:id` | required | — |
| POST | `/projects` | required | `{ name, description?, customerId?, status?, budget?, startDate?, endDate? }` |
| PATCH | `/projects/:id` | required | partial of the above |
| DELETE | `/projects/:id` | **RBAC** `ADMIN, MANAGER` | — |

## Tasks

| Method | Path | Auth | Query / Body |
|---|---|---|---|
| GET | `/tasks` | required | `page, limit, search, status, priority, projectId, employeeId` |
| GET | `/tasks/:id` | required | — |
| POST | `/tasks` | required | `{ projectId, employeeId?, title, description?, status?, priority?, dueDate? }` |
| PATCH | `/tasks/:id` | required | partial of the above — marking `status: "DONE"` raises a notification |
| DELETE | `/tasks/:id` | **RBAC** `ADMIN, MANAGER` | — |

## Finance

| Method | Path | Auth | Query / Body |
|---|---|---|---|
| GET | `/finance/invoices` | required | `page, limit, search, status, customerId` |
| GET | `/finance/invoices/:id` | required | — |
| POST | `/finance/invoices` | **RBAC** `ADMIN, MANAGER` | `{ customerId, invoiceNumber, amount, status?, dueAt? }` |
| PATCH | `/finance/invoices/:id` | **RBAC** `ADMIN, MANAGER` | partial of the above |
| DELETE | `/finance/invoices/:id` | **RBAC** `ADMIN` | — |
| POST | `/finance/invoices/:id/payments` | **RBAC** `ADMIN, MANAGER` | `{ amount, method? }` — auto-marks the invoice `PAID` once fully covered |

## Notifications

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/notifications` | required | `page, limit, isRead` |
| GET | `/notifications/unread-count` | required | `{ count }` |
| PATCH | `/notifications/:id/read` | required | Marks one notification read |
| PATCH | `/notifications/read-all` | required | Marks all notifications read |

## Documents

| Method | Path | Auth | Query / Body |
|---|---|---|---|
| GET | `/documents` | required | `page, limit, search, tag` |
| GET | `/documents/:id` | required | — |
| POST | `/documents` | required | `{ name, url, mimeType?, sizeBytes?, tags? }` |
| PATCH | `/documents/:id` | required | partial of the above |
| DELETE | `/documents/:id` | required | — |

## AI Insights

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/ai-insights` | required | Returns generated insight cards (see [ARCHITECTURE.md](ARCHITECTURE.md)) |

## Analytics

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/analytics/overview` | required | Revenue/new-customers by month (last 6), tasks/projects/invoices by status, task completion rate |

## Settings

| Method | Path | Auth | Body |
|---|---|---|---|
| GET | `/settings/organization` | required | — |
| PATCH | `/settings/organization` | **RBAC** `ADMIN` | `{ organizationName?, timezone?, currency?, dateFormat?, logoUrl? }` |
| PATCH | `/settings/profile` | required | `{ name?, currentPassword?, newPassword? }` — `currentPassword` required if `newPassword` is set |

## Health check

| Method | Path | Auth |
|---|---|---|
| GET | `/health` | none |
