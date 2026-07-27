# Deployment

The app deploys as a **single Vercel project**: the React app builds to static
files, and the Express API is exported from `api/index.ts`, which Vercel's
`@vercel/node` builder automatically wraps as a serverless function (Vercel
recognizes an Express app exported as the default export of a file under
`/api` and handles it with no adapter needed). `vercel.json` rewrites
`/api/*` to that function and everything else to the built SPA.

The pipeline is two GitHub Actions workflows:

- **`.github/workflows/ci.yml`** — on every push/PR to `main`: install, generate
  the Prisma client, validate the schema, lint, typecheck, test, build.
- **`.github/workflows/deploy.yml`** — triggered by `workflow_run` once CI
  finishes successfully on `main`: applies pending Prisma migrations against
  the production database, then builds and deploys to Vercel via the Vercel
  CLI.

## One-time setup

### 1. Create the production database (Neon)

1. Create a project at [neon.tech](https://neon.tech).
2. Copy the **pooled** connection string (host contains `-pooler`) — this is
   your production `DATABASE_URL`.
3. Copy the **direct** connection string (no `-pooler`) — this is your
   production `DIRECT_URL`, used only for running migrations.

### 2. Create the GitHub repository and push

```bash
git init
git add .
git commit -m "Initial commit: Tech-Hub"
git branch -M main
git remote add origin <your-repo-url>
git push -u origin main
```

### 3. Create the Vercel project

1. Install the Vercel CLI locally: `npm install -g vercel`
2. From the repo root: `vercel link` (creates the project and links this
   directory to it; choose "no" if asked whether to override existing
   settings, since `vercel.json` already configures the build).
3. In the Vercel dashboard, add these **Environment Variables** to the
   project (Production — and Preview if you want preview deploys to work):
   - `DATABASE_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`,
     `JWT_ACCESS_EXPIRES_IN` (`15m`), `JWT_REFRESH_EXPIRES_IN` (`7d`),
     `CORS_ORIGIN` (your deployed frontend URL, e.g. `https://your-app.vercel.app`)
   - `VITE_API_BASE_URL` set to `https://your-app.vercel.app/api`

   Note `CORS_ORIGIN` and `VITE_API_BASE_URL` both depend on the final
   Vercel URL — deploy once first to learn the URL, then set these two and
   redeploy.

### 4. Add GitHub Actions secrets

In the GitHub repo: **Settings → Secrets and variables → Actions**, add:

| Secret | Value |
|---|---|
| `DATABASE_URL` | Neon pooled connection string |
| `DIRECT_URL` | Neon direct connection string |
| `VERCEL_TOKEN` | Personal token from Vercel → Settings → Tokens |
| `VERCEL_ORG_ID` | From `.vercel/project.json` after running `vercel link` |
| `VERCEL_PROJECT_ID` | From `.vercel/project.json` after running `vercel link` |

Also create a GitHub **Environment** named `production` (Settings →
Environments) — `deploy.yml` deploys under this environment, which lets you
optionally require manual approval before production deploys.

### 5. Ship it

Push to `main`. `ci.yml` runs first; once it succeeds, `deploy.yml` fires
automatically, migrates the production database, and deploys to Vercel.

## Manual deploy (without CI/CD)

If you want to deploy directly from your machine once, without waiting on
GitHub Actions:

```bash
npx prisma migrate deploy   # against production DATABASE_URL/DIRECT_URL
vercel --prod
```

## Rolling back

Vercel keeps every deployment; promote a previous one from the dashboard
(Deployments → select a prior deploy → "Promote to Production") if a release
needs to be reverted. Database migrations are additive by default — a schema
rollback requires writing and applying a down-migration by hand, Prisma
Migrate does not auto-generate one.
