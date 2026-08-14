# Sajilo Kheti — Backend

The API server for **Sajilo Kheti**, a MERN-based land leasing and farming education platform. Built with Express and tRPC, it handles authentication verification, land listings, lease applications, and escrow-based payment settlement between landowners and land leasers.

## Overview

The backend sits behind Clerk-issued JWTs. All requests pass through a Clerk middleware layer that verifies the token and constructs a typed request context (user identity + role), which is then dispatched to one of four domain routers, each enforcing role-based access control.

```
Client (Next.js / tRPC client)
        │  Authenticated HTTP + JWT
        ▼
  Clerk Middleware + Context
        │
        ├── userRouter
        ├── landRouter
        ├── leaseRouter
        └── escrowRouter ── EscrowService
        │
        ▼
   MongoDB (via Prisma)
   User | Land | Application | Escrow | LeaseAgreement | KYC
```

## Tech Stack

| Component | Technology | Purpose |
|---|---|---|
| Server framework | Express.js | HTTP server / API host |
| API layer | tRPC | Type-safe procedures shared with the frontend |
| ORM | Prisma | Type-safe MongoDB access & schema modeling |
| Database | MongoDB | Persistent storage |
| Auth verification | Clerk | JWT verification, identity, role context |
| Validation | Zod | Input/schema validation on all procedures |
| File storage | UploadThing | Land images, ownership/legal document storage |
| OCR | Tesseract.js | Extracts text (plot numbers, owner names) from uploaded land documents during KYC review |
| Real-time chat | Stream.io (GetStream) | Chat channel creation/management post lease acceptance |
| Payments | eSewa | Escrow payment initiation and verification |
| CMS | Sanity.io | Backing store for blog/education content |

## Core Domains / Routers

- **userRouter** — registration, profile, KYC submission/approval, role upgrades
- **landRouter** — listing publish/search/moderation
- **leaseRouter** — proposal submission, acceptance/rejection, application tracking
- **escrowRouter** + **EscrowService** — escrow deposits, Malpot verification, fund release/refund

### Lease/Escrow State Flow

```
PENDING → ACCEPTED → HOLDING → RELEASED / REFUNDED → LEASED
```

## API Reference

### User Management (`/users`)

| Procedure | Access | Description |
|---|---|---|
| `create` | Public | Creates/upserts a user with hydrated Clerk data |
| `me` | Protected | Returns the current user's profile |
| `upgrade-request` | Protected | Submits KYC details to request `OWNER` role |
| `kyc-details` | Protected | Returns the current user's KYC submission/status |
| `all` | Admin | Lists all users with hydrated identity data |
| `update-kyc-status` | Admin | Approves/rejects a KYC submission |
| `all-kyc` | Admin | Lists all KYC applications for review |

### Land Management (`/land`)

| Procedure | Access | Description |
|---|---|---|
| `publish` | Owner | Publishes a new land listing |
| `search` | Public | Searches listings by location/price filters |
| `{landId}` | Public | Returns detail for a specific listing |
| `accept` | Admin | Approves a listing, making it publicly visible |
| `reject` | Admin | Rejects a listing |
| `update-status` | Admin | Manually updates a listing's status |
| `admin/all` | Admin | Lists all listings for moderation, with optional status filter |

### Lease Management (`/lease`)

| Procedure | Access | Description |
|---|---|---|
| `submit-application` | Leaser | Submits a lease proposal for a listing |
| `accept-application` | Owner | Accepts a proposal; triggers escrow phase |
| `reject-application` | Owner | Rejects a proposal |
| `application/{id}` | Protected | Returns a specific application's detail |
| `applications` | Protected | Lists applications relevant to the current user |
| `my-accepted-apps` | Protected | Returns only accepted lease bids |

### Escrow & Payment (`/escrow`, `/lease`)

| Procedure | Access | Description |
|---|---|---|
| `pay-escrow` | Leaser | Deposits lease funds into escrow |
| `verify-malpot` | Admin | Verifies ownership papers and releases escrow funds |
| `my-escrows` | Leaser | Lists escrows initiated by the current leaser |
| `my-owner-escrows` | Owner | Lists escrows where the current user is the beneficiary |
| `{id}` | Protected | Returns transaction history/status for an escrow |
| `save-chat-channel` | Protected | Stores a chat channel ID associated with an escrow |

## Data Model (Prisma / MongoDB collections)

- `User`
- `Land`
- `Application`
- `Escrow`
- `LeaseAgreement`
- `KYC`

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB instance (Atlas or self-hosted)
- Clerk backend/secret keys
- UploadThing, Stream.io (GetStream), eSewa merchant credentials

### Installation

```bash
git clone <repo-url>
cd backend
npm install
```

### Environment Variables

```env
DATABASE_URL=                 # MongoDB connection string (used by Prisma)
CLERK_SECRET_KEY=
CLERK_JWT_KEY=
UPLOADTHING_TOKEN=
STREAM_API_KEY=
STREAM_API_SECRET=
ESEWA_MERCHANT_CODE=
ESEWA_SECRET_KEY=
PORT=4000
```

### Prisma Setup

```bash
npx prisma generate
npx prisma db push
```

### Run Locally

```bash
npm run dev
```

Server starts on `http://localhost:4000` (or the configured `PORT`); tRPC endpoint is exposed at `/trpc`.

### Build & Start (Production)

```bash
npm run build
npm run start
```

## Testing

- **Vitest** for unit tests (auth middleware, escrow state transitions, router logic)
- **React Testing Library** is used on the frontend side only
- **Playwright** covers full E2E flows that exercise this API (proposal submission → owner notification, lease acceptance → chat channel creation, escrow hold → verify → release)

```bash
npm run test
```

## Security Notes

- Every procedure runs behind Clerk JWT verification; role checks (`Owner`, `Leaser`, `Admin`) are enforced server-side per router — never rely on frontend gating alone.
- Escrow funds are held in a `HOLDING` state until an admin verifies the signed Malpot agreement; only then does `EscrowService` release funds to the owner.
- KYC approval is currently a manual admin action (see Limitations in the project report) — flagged as a scaling concern for future automated verification.

---
*Part of the Sajilo Kheti minor project (NCE, Department of Electronics & Computer Engineering, Tribhuvan University — Pawan Thapa, Rohit Khanal, Sudarshan Dhakal, Tilak Rokaya, 2026).*
