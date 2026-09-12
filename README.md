# Mini ERP + CRM Operations Portal

> A full-stack wholesale and distribution operations portal built with **Node.js, Express, TypeScript, PostgreSQL, Prisma ORM, and React (Vite)**.

---

## Case Study Requirements & Source of Truth

This application strictly implements all mandatory hiring assignment requirements:

1. **Database**: **PostgreSQL** with **Prisma ORM** .
2. **Terminology**: Uses exact terms — `Customer CRM`, `Product and Inventory`, `Sales Challan`, `Authentication and Roles`.
3. **Roles**: Strictly enforces **`ADMIN`**, **`SALES`**, **`WAREHOUSE`**, and **`ACCOUNTS`** (No Manager or Sales Rep).
4. **Critical Business Feature**: **Sales Challan confirmation uses ONE atomic Prisma transaction**. If any product stock is insufficient, the entire transaction rolls back cleanly with 0 stock deducted.

---

## Quick Setup Instructions

### Prerequisites
- Node.js (v18+) & npm
- PostgreSQL database instance running locally or via cloud (Docker / Supabase / Neon / Local Postgres)

### 1. Backend Setup & Configuration
```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Configure environment variables
# Run this from the repository root, then update the local PostgreSQL credentials.
copy server\.env.example server\.env
```

### 2. Database Schema Push & Seed
```bash
# Apply the Prisma migration to PostgreSQL
npm run prisma:deploy

# Seed database with initial Roles, Sample Customers, Products, and Inventory
npm run prisma:seed
```

### 3. Run Automated Tests
```bash
# Execute Jest test suite (Includes Mandatory Critical Single-Transaction Stock Rollback Test)
npm test
```

### 4. Start Backend & Frontend Servers
```bash
# Start backend Express server (Port 5000)
npm run dev

# In a new terminal, navigate to client directory and start React/Vite dev server
cd ../client
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser to access the portal.

---

## Demo Login Credentials

The application provides quick-fill buttons on the login page:

| Role | Email | Password | Allowed Access |
|---|---|---|---|
| **ADMIN** | `admin@example.com` | `Admin@123` | Full System Access |
| **SALES** | `sales@example.com` | `Sales@123` | Customer CRM, Create & Confirm Sales Challans |
| **WAREHOUSE** | `warehouse@example.com` | `Warehouse@123` | Products, Stock IN/OUT, Inventory Log |
| **ACCOUNTS** | `accounts@example.com` | `Accounts@123` | Read-only Directory, Customer & Challan Views |

---

## Critical Transaction Demonstration

To test the **Atomic Sales Challan Confirmation Transaction**:
1. Log in as `SALES` (`sales@example.com`).
2. Navigate to **Sales Challans** -> **Create New Challan**.
3. Select a Customer and add two products:
   - Product A with quantity within stock.
   - Product B with quantity **greater than current stock**.
4. Click **Save Draft Challan**. Note that stock remains unchanged.
5. Open the newly created draft challan and click **Confirm & Deduct Stock**.
6. The system will throw an immediate error: `Insufficient stock for product...`.
7. Inspect database / UI: **Zero stock was deducted for Product A**, **Zero stock movements were created**, and the Challan status remains **`DRAFT`**.

## Production Deployment Runbook

### Backend

1. Provision PostgreSQL and create the `erp_crm` database.
2. Set `DATABASE_URL`, a strong `JWT_SECRET`, `JWT_EXPIRES_IN`, `CLIENT_URL`, and `NODE_ENV=production` in `server/.env` or the hosting provider's secret store.
3. Install, migrate, build, and start the server:

```bash
cd server
npm ci
npm run prisma:generate
npm run prisma:deploy
npm run build
npm start
```

4. Verify `GET /health` returns HTTP 200 before sending traffic to the API.

### Frontend

Build the client with `VITE_API_URL` pointing at the deployed API base URL, for example `https://api.example.com/api`:

```bash
cd client
npm ci
npm run build
npm run preview
```

Serve the generated `client/dist` directory from a static host or CDN. Configure SPA fallback to `index.html` so browser refreshes on `/dashboard`, `/customers`, `/products`, `/inventory`, and `/challans` continue to work.

## Verification Evidence

The implementation was verified against PostgreSQL with:

```bash
cd server
npx prisma validate
npm run build
npm test -- --runInBand

cd ../client
npm run build
```

The backend integration suite passed **15 tests with 0 failures**, including authentication, RBAC, customer follow-ups, duplicate SKU handling, stock validation, challan snapshots, successful stock deduction, double-confirmation protection, and all-or-nothing rollback for insufficient stock.

---

## 📁 Repository Structure
```
case_study/
├── CASE_STUDY.md           # Detailed Architectural & Case Study Documentation
├── postman_collection.json # Postman API Collection
├── README.md               # Quickstart & Verification Guide
├── server/
│   ├── prisma/
│   │   ├── schema.prisma   # PostgreSQL Prisma Schema
│   │   └── seed.ts         # Database Seed Script
│   ├── src/
│   │   ├── config/         # Environment Validation (Zod)
│   │   ├── controllers/    # Express Controllers
│   │   ├── middleware/     # JWT Auth, RBAC & Error Handling
│   │   ├── routes/         # Express API Routes
│   │   ├── services/       # Core Business Logic & Transactions
│   │   ├── validators/     # Zod Schemas
│   │   └── __tests__/      # Jest Integration Test Suite
│   ├── package.json
│   └── tsconfig.json
└── client/
    ├── src/
    │   ├── api/            # API Client
    │   ├── components/     # Layout, Sidebar, Toast, Modals
    │   ├── context/        # Auth Context State
    │   ├── pages/          # Dashboard, CRM, Products, Inventory, Challans
    │   └── App.tsx
    ├── package.json
    └── vite.config.ts
```
