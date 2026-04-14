# CampaignIQ Email-Only MVP

CampaignIQ is an email marketing SaaS MVP with:
- Next.js frontend (`client`) for landing/auth/dashboard/campaign/email-builder/analytics/settings/profile/pricing/payment pages.
- Express + Prisma backend (`server`) for auth, contacts, audiences, templates, campaigns, tracking, and mock Stripe checkout.
- SMTP relay service (`emailvercel-main`) used as external email sender (`/api/send` contract unchanged).

## Local setup

### 1) Backend (`server`)
- Create `server/.env` with:
  - `DATABASE_URL=postgresql://...`
  - `JWT_SECRET=...`
  - `FRONTEND_URL=http://localhost:3000`
  - `EMAIL_SERVICE_URL=http://localhost:3001` (or deployed relay URL)
  - `BACKEND_URL=http://localhost:5000`
  - Optional Stripe: `STRIPE_SECRET_KEY=...`
- Run:
  - `npm install --prefix ./server`
  - `npx prisma generate --schema ./server/prisma/schema.prisma`
  - `npm run dev --prefix ./server`

### 2) Frontend (`client`)
- Create `client/.env.local` with:
  - `NEXT_PUBLIC_API_URL=http://localhost:5000`
- Run:
  - `npm install --prefix ./client`
  - `npm run dev --prefix ./client`

### 3) SMTP Relay (`emailvercel-main`)
- Keep existing relay logic unchanged.
- Configure relay env vars from `emailvercel-main/.env.example`.
- Backend sends payload as:
  - `{ email, subject, htmlContent }`

## Deployed topology (recommended)
- Frontend on Vercel (`client`).
- Backend on Render (`server`).
- Email relay on Vercel (`emailvercel-main`).
- Set production values for:
  - `FRONTEND_URL` on backend
  - `BACKEND_URL` on backend
  - `NEXT_PUBLIC_API_URL` on frontend
  - `ALLOWED_ORIGIN` on relay

## Completed MVP features
- Auth: register/login/me/profile/password update.
- Contact management + CSV bulk import.
- Audience management for campaign targeting.
- Template save/edit/delete via email builder output HTML.
- Campaign create/list/delete/send with open/click/unsubscribe tracking injection.
- Analytics overview and per-campaign metrics from tracked events.
- Pricing + payment gateway flow with Stripe mock mode fallback.

## Deferred to next phase
- Provider delivery/bounce/complaint webhooks (currently bounce remains placeholder).
- Production Stripe webhook lifecycle sync (mock checkout mode is active when Stripe key is absent).
