# Mini ERP + CRM Operations Portal — Technical Case Study & Architecture Document

## Executive Summary
This project is a high-performance, full-stack **Mini ERP + CRM Operations Portal** engineered for wholesale and distribution enterprises. Built with **Node.js, Express, TypeScript, PostgreSQL, Prisma ORM, and React (Vite)**, the system manages customers, inventory, sales challans, and stock audit logs with strict Role-Based Access Control (RBAC).

---

## 1. Core Architecture & Tech Stack

| Layer | Technology | Rationale & Usage |
|---|---|---|
| **Database** | PostgreSQL | Relational database enforcing ACID compliance and foreign key integrity. |
| **ORM** | Prisma ORM | Type-safe query builder, declarative migrations, and atomic `$transaction` isolation. |
| **Backend API** | Node.js + Express + TypeScript | Modular controller-service architecture with strict Zod validation schemas. |
| **Security** | JWT + Bcrypt | JSON Web Tokens with 24-hour expiration; password hashing via bcrypt (salt 10). |
| **Frontend UI** | React 18 + Vite + CSS Variables | Glassmorphic dark enterprise dashboard with responsive sidebar & role-based UI filters. |
| **Testing** | Jest + Supertest | Integration test suite verifying auth, RBAC permissions, and single-transaction rollback. |

---

## 2. Role-Based Access Control (RBAC) Matrix

The system strictly enforces role permissions at both API middleware level (`403 Forbidden` response) and frontend UI menu filters:

| Module / Endpoint | ADMIN | SALES | WAREHOUSE | ACCOUNTS |
|---|:---:|:---:|:---:|:---:|
| **Authentication & Profile** | ✅ | ✅ | ✅ | ✅ |
| **Customer CRM (Read)** | ✅ | ✅ | ❌ | ✅ |
| **Customer CRM (Create / Update / Follow-up)** | ✅ | ✅ | ❌ | ❌ |
| **Products & Catalog (Read)** | ✅ | ✅ | ✅ | ✅ |
| **Products & Catalog (Create / Edit)** | ✅ | ❌ | ✅ | ❌ |
| **Stock IN / Stock OUT Adjustments** | ✅ | ❌ | ✅ | ❌ |
| **Stock Movement Log (Audit)** | ✅ | ❌ | ✅ | ✅ |
| **Sales Challans (Read)** | ✅ | ✅ | ✅ | ✅ |
| **Sales Challan (Create Draft)** | ✅ | ✅ | ❌ | ❌ |
| **Sales Challan (Confirm & Deduct Stock)** | ✅ | ✅ | ❌ | ❌ |

---

## 3. Business Critical Feature: Atomic Sales Challan Confirmation Transaction

### Architecture & Guarantee
Sales Challan Confirmation is executed within a **single Prisma `$transaction`** (`prisma.$transaction(async (tx) => { ... })`). This guarantees **all-or-nothing atomicity**:

1. **Pre-Check (Read Lock)**: The transaction iterates through every item in the sales challan and queries the live `Product` stock in PostgreSQL.
2. **Validation**:
   - If `product.currentStock < item.quantity` for ANY product:
     - The transaction throws an error `Insufficient stock for product '<Name>' (SKU: <SKU>). Available: X, Requested: Y`.
     - PostgreSQL rolls back all changes automatically.
     - Zero product stock is deducted, zero stock movement OUT records are created, and the Sales Challan status remains `DRAFT`.
3. **Execution**:
   - If stock for ALL products is sufficient:
     - Stock is atomically decremented: `tx.product.update({ data: { currentStock: { decrement: item.quantity } } })`.
     - Audit records are inserted into `StockMovement`: `tx.stockMovement.create({ data: { movementType: 'OUT', reason: 'Challan Confirmation SC-XXXXXX' } })`.
     - The Sales Challan status is updated to `CONFIRMED`.

### Product Snapshots
When a Sales Challan is created, the system copies snapshot values (`productNameSnapshot`, `skuSnapshot`, `unitPriceSnapshot`) directly into the line items. This preserves accurate historical billing records even if the master product price or name is subsequently altered in the catalog.

---

## 4. Database ERD & Schema Structure

```
User (id, name, email, passwordHash, role, isActive)
  │
  ├── Customer (id, customerName, mobileNumber, email, businessName, gstNumber, customerType, address, status, followUpDate, notes)
  │     ├── CustomerFollowUp (id, note, followUpDate, createdBy)
  │     └── SalesChallan (id, challanNumber, customerId, totalQuantity, status, createdBy)
  │           └── SalesChallanItem (id, productId, productNameSnapshot, skuSnapshot, unitPriceSnapshot, quantity, lineTotal)
  │
  └── StockMovement (id, productId, quantityChanged, movementType, reason, createdBy)
        └── Product (id, name, sku, category, unitPrice, currentStock, minimumStockAlertQuantity, warehouseLocation)
```

---

## 5. API Reference & Endpoints

### Authentication
- `POST /api/auth/login` — Authenticate user and receive JWT.
- `GET /api/auth/me` — Fetch authenticated user profile.

### Customer CRM
- `GET /api/customers?search=&status=&customerType=&page=&limit=` — Paginated customer directory.
- `POST /api/customers` — Create customer.
- `GET /api/customers/:id` — Customer details, follow-up log, and past challans.
- `PUT /api/customers/:id` — Update customer.
- `POST /api/customers/:id/follow-ups` — Add follow-up note and update scheduled date.

### Products & Inventory
- `GET /api/products?search=&category=&page=&limit=` — Product catalog with stock badges.
- `POST /api/products` — Create new product (creates initial Stock IN if stock > 0).
- `GET /api/products/:id` — Product details and movement history.
- `PUT /api/products/:id` — Update product details.
- `POST /api/products/:id/stock-in` — Stock intake transaction.
- `POST /api/products/:id/stock-out` — Stock deduction transaction (validates available stock).
- `GET /api/stock-movements?movementType=&page=&limit=` — Audit log of stock movements.

### Sales Challans
- `GET /api/challans?search=&status=&page=&limit=` — List sales challans.
- `POST /api/challans` — Create DRAFT sales challan (does not reduce stock).
- `GET /api/challans/:id` — Challan details with item snapshots.
- `POST /api/challans/:id/confirm` — **Atomic Challan Confirmation Transaction**.
- `POST /api/challans/:id/cancel` — Cancel draft challan.

### Dashboard
- `GET /api/dashboard/metrics` — Executive operational summary metrics.

---

## 6. Verification & Automated Test Results

The backend includes a full Jest integration test suite in `server/src/__tests__/api.test.ts` verifying:
- Authentication & password validation
- RBAC permissions (403 Forbidden enforcement)
- Customer CRM creation & follow-up log
- Stock IN and OUT validation
- **Critical Transaction Test**: Attempting confirmation with insufficient stock rolls back all items, preserving original stock levels and leaving the challan in DRAFT status.
