# Vercel Deployment

Deploy this repository as three Vercel projects from the same Git repository.

## 1. Kalahari Marketing Site

Project root:

```text
apps/marketing-site
```

Vercel settings:

```text
Framework Preset: Next.js
Install Command: npm install
Build Command: npm run build
Output Directory: .next
Node.js Version: 24.x
Production Domain: kalahari.co.za
```

Environment variables:

```text
NEXT_PUBLIC_API_BASE_URL=https://api.kalahari.co.za
NEXT_PUBLIC_PORTAL_BASE_URL=https://kredo.kalahari.co.za
```

## 2. Kredo Application Portal

Project root:

```text
apps/app-portal
```

Vercel settings:

```text
Framework Preset: Other
Install Command: npm install
Build Command: npm run build
Output Directory: dist/kredo-portal/browser
Node.js Version: 24.x
Production Domain: kredo.kalahari.co.za
```

The SPA fallback rewrite is defined in `apps/app-portal/vercel.json`.

## 3. Shared Backend API

Project root:

```text
apps/backend
```

Vercel settings:

```text
Framework Preset: Other
Install Command: npm install
Build Command: npm run build
Node.js Version: 24.x
Production Domain: api.kalahari.co.za
```

The serverless function entrypoint is `apps/backend/api/index.ts`, and all API routes are rewritten to it by `apps/backend/vercel.json`.

Required environment variables:

```text
SUPABASE_URL=...
SUPABASE_SERVICE_KEY=...
ENCRYPTION_KEY=...
CORS_ORIGINS=https://kalahari.co.za,https://www.kalahari.co.za,https://kredo.kalahari.co.za
```

`ENCRYPTION_KEY` should be a 64-character hex string for a 32-byte AES key.

## Supabase Setup

Before deploying the API, run the SQL in:

```text
apps/backend/supabase-schema.sql
```

against the target Supabase database. The backend requires the tables and the `create_ledger_transaction` RPC defined there.

## Local Verification

From the repository root:

```bash
npm run build -w apps/backend
npm test -w apps/backend
npm run build -w apps/marketing-site
npx tsc -p apps/app-portal/tsconfig.app.json --noEmit
```

The Angular production build requires Node 24.x on Vercel because Vercel's Node 22 image may resolve below Angular 22's required `v22.22.3` patch level.
