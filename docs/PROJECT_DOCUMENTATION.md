# Mini ERP + CRM Operations Portal

## 1. Project Overview

The Mini ERP + CRM Operations Portal is a full-stack wholesale distribution application. It combines customer relationship management, product catalog management, inventory control, sales challan workflows, dashboard metrics, authentication, and role-based access control in one portal.

The application has two deployable services:

- **Frontend:** React 18 and Vite static site.
- **Backend:** Node.js, Express, TypeScript, Prisma, and PostgreSQL.

### Production URLs

- Frontend: https://mini-erp-crm-operations-portal-1-14zw.onrender.com
- Backend API: https://mini-erp-crm-operations-portal-efdf.onrender.com
- Health check: https://mini-erp-crm-operations-portal-efdf.onrender.com/health
- GitHub repository: https://github.com/Nikhilreddy1011/mini-erp-crm-operations-portal

## 2. Technology Stack

| Area | Technology | Purpose |
| --- | --- | --- |
| Frontend | React 18 | Component-based user interface |
| Frontend build | Vite and TypeScript | Fast development server and production bundling |
| Routing | React Router | Login, dashboard, CRM, inventory, product, and challan routes |
| Backend | Node.js, Express, TypeScript | REST API and application services |
| Validation | Zod | Request payload and environment validation |
| Database | PostgreSQL | Relational persistence and transactional consistency |
| ORM | Prisma 5 | Type-safe database access and migrations |
| Authentication | JWT and bcryptjs | Token-based sessions and password hashing |
| Testing | Jest and Supertest | API integration and business workflow testing |
| Hosting | Render | Frontend static site and backend web service |
| Production database | Neon PostgreSQL | Hosted PostgreSQL database |

## 3. Repository Structure

```text
case_study/
|-- client/
|   |-- src/
|   |   |-- api/          API client and error handling
|   |   |-- components/   Navbar, sidebar, and toast components
|   |   |-- context/      Authentication context
|   |   |-- layouts/      Authenticated application layout
|   |   |-- pages/        Login, dashboard, CRM, inventory, products, challans
|   |   |-- App.tsx       React routes
|   |   |-- main.tsx      React entry point
|   |   `-- index.css     Global styling
|   |-- public/
|   |   `-- _redirects   Static-host SPA fallback declaration
|   |-- package.json
|   |-- vite.config.ts
|   |-- tsconfig.json
|   `-- index.html
|-- server/
|   |-- prisma/
|   |   |-- schema.prisma
|   |   |-- seed.ts
|   |   `-- migrations/
|   |-- src/
|   |   |-- config/       Environment validation
|   |   |-- controllers/  HTTP request handlers
|   |   |-- middleware/   Authentication and error handling
|   |   |-- routes/       REST route registration
|   |   |-- services/     Business logic and transactions
|   |   |-- types/        Shared server types
|   |   |-- utils/        Prisma and response helpers
|   |   |-- validators/   Zod request schemas
|   |   `-- __tests__/    Jest integration tests
|   |-- package.json
|   |-- tsconfig.json
|   `-- jest.config.ts
|-- CASE_STUDY.md
|-- README.md
|-- SUBMISSION.md
`-- postman_collection.json
```

## 4. Application Modules

### Authentication and roles

Users sign in through `POST /api/auth/login`. Passwords are compared with bcrypt hashes and a signed JWT is returned. The frontend stores the token locally and sends it as a Bearer token for protected API requests.

The authenticated user is loaded through `GET /api/auth/me`. Backend middleware verifies the token and applies role checks before protected operations are executed.

### Customer CRM

The CRM module supports:

- Customer directory search and pagination.
- Customer type and status filtering.
- Customer creation and updates.
- Customer detail views.
- Follow-up notes and scheduled follow-up dates.
- Customer-linked sales challans.

### Products and inventory

The inventory module supports:

- Product catalog management.
- SKU uniqueness validation.
- Current stock and minimum stock thresholds.
- Warehouse location tracking.
- Stock IN and Stock OUT transactions.
- Stock movement audit history.
- Low-stock and out-of-stock dashboard indicators.

### Sales challans

A sales challan is created as a draft and does not immediately reduce inventory. A user with the required role can later confirm the challan. Confirmation validates and deducts all requested stock in one database transaction.

Each challan item stores product snapshots for historical accuracy:

- Product name at the time of creation.
- SKU at the time of creation.
- Unit price at the time of creation.
- Quantity and calculated line total.

### Dashboard

The dashboard aggregates operational data including customer counts, product counts, stock alerts, challan totals, and recent activity.

## 5. Role-Based Access Control

| Capability | ADMIN | SALES | WAREHOUSE | ACCOUNTS |
| --- | :---: | :---: | :---: | :---: |
| Sign in and view profile | Yes | Yes | Yes | Yes |
| View customers | Yes | Yes | No | Yes |
| Create or update customers | Yes | Yes | No | No |
| Add customer follow-ups | Yes | Yes | No | No |
| View products | Yes | Yes | Yes | Yes |
| Create or update products | Yes | No | Yes | No |
| Stock IN and Stock OUT | Yes | No | Yes | No |
| View stock movement log | Yes | No | Yes | Yes |
| View sales challans | Yes | Yes | Yes | Yes |
| Create draft challans | Yes | Yes | No | No |
| Confirm or cancel challans | Yes | Yes | No | No |

Authorization is enforced on the backend. Frontend menu filtering improves usability but is not treated as a security boundary.

## 6. Critical Transaction Workflow

Sales challan confirmation uses a single Prisma transaction:

1. Load the draft challan and its items.
2. Validate that the challan is still in `DRAFT` status.
3. Read current stock for every product.
4. Reject the transaction if any requested quantity exceeds available stock.
5. Decrement every product quantity.
6. Create an `OUT` stock movement for every item.
7. Change the challan status to `CONFIRMED`.

If any item fails validation, PostgreSQL rolls back every change. This guarantees that a partially confirmed challan cannot deduct stock for only some products.

Example failure behavior:

```text
Product A has sufficient stock.
Product B does not have sufficient stock.

Result:
- Product A stock is unchanged.
- Product B stock is unchanged.
- No OUT movements are created.
- Challan remains DRAFT.
```

## 7. Database Design

The Prisma schema contains these main entities:

- `User`: login identity, role, active state, and audit ownership.
- `Customer`: CRM contact and business information.
- `CustomerFollowUp`: dated customer interaction notes.
- `Product`: catalog, price, stock, SKU, and warehouse location.
- `StockMovement`: auditable stock IN and OUT records.
- `SalesChallan`: customer order document and workflow status.
- `SalesChallanItem`: challan line items with historical product snapshots.

Important constraints include:

- Unique user email.
- Unique product SKU.
- Unique challan number.
- Foreign keys between customers, users, products, movements, challans, and items.
- Cascade deletion for customer follow-ups and challan items where appropriate.
- Indexes for status, type, SKU, email, mobile number, and creation date.

## 8. API Reference

All API routes use the `/api` prefix.

### Authentication

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/api/auth/login` | Validate credentials and return JWT |
| GET | `/api/auth/me` | Return the authenticated user |

### Customers

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/customers` | Search and paginate customers |
| POST | `/api/customers` | Create a customer |
| GET | `/api/customers/:id` | Get customer details and follow-ups |
| PUT | `/api/customers/:id` | Update a customer |
| POST | `/api/customers/:id/follow-ups` | Add a follow-up note |

### Products and inventory

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/products` | Search and paginate products |
| POST | `/api/products` | Create a product |
| GET | `/api/products/:id` | Get product and movement details |
| PUT | `/api/products/:id` | Update product details |
| POST | `/api/products/:id/stock-in` | Add stock and create an IN movement |
| POST | `/api/products/:id/stock-out` | Remove stock after validation |
| GET | `/api/stock-movements` | View the inventory audit log |

### Sales challans and dashboard

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/challans` | Search and paginate challans |
| POST | `/api/challans` | Create a draft challan |
| GET | `/api/challans/:id` | Get challan details |
| POST | `/api/challans/:id/confirm` | Confirm atomically and deduct stock |
| POST | `/api/challans/:id/cancel` | Cancel a draft challan |
| GET | `/api/dashboard/metrics` | Return dashboard metrics |
| GET | `/health` | Return service health status |

The Postman collection is available at [postman_collection.json](../postman_collection.json).

## 9. Local Development

### Prerequisites

- Node.js 18 or later.
- npm.
- PostgreSQL  database, local or hosted.

### Backend setup

From the repository root in PowerShell:

```powershell
cd server
npm install
Copy-Item .env.example .env
```

Update `server/.env`:

```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/erp_crm?schema=public"
JWT_SECRET=replace_with_a_local_secret
JWT_EXPIRES_IN=1d
```

Initialize and seed the database:

```powershell
npm run prisma:generate
npm run prisma:deploy
npm run prisma:seed
```

Start the API:

```powershell
npm run dev
```

### Frontend setup

Open a second terminal from the repository root:

```powershell
cd client
npm install
npm run dev
```

Open `http://localhost:5173`.

Vite proxies `/api` requests to `http://localhost:5000` during local development. This proxy is not used in production; the production frontend must be built with `VITE_API_URL` set to the deployed API base URL.

## 10. Demo Accounts

These accounts are created by the seed script. They are for the demo environment only.

| Role | Email | Password |
| --- | --- | --- |
| ADMIN | `admin@example.com` | `Admin@123` |
| SALES | `sales@example.com` | `Sales@123` |
| WAREHOUSE | `warehouse@example.com` | `Warehouse@123` |
| ACCOUNTS | `accounts@example.com` | `Accounts@123` |

The seed script deletes existing application records before inserting demo records. Never run it against a database containing data that must be preserved.

## 11. Production Deployment on Render

### Backend service

Recommended Render settings when the service root directory is `server`:

```text
Root Directory: server
Build Command: npm ci && npm run prisma:generate && npm run prisma:deploy && npm run build
Start Command: npm start
```

Required backend environment variables:

```text
DATABASE_URL=<Neon or other PostgreSQL connection string>
JWT_SECRET=<strong production secret>
JWT_EXPIRES_IN=1d
CLIENT_URL=https://mini-erp-crm-operations-portal-1-14zw.onrender.com
NODE_ENV=production
```

For a new demo database on a free Render plan without Shell access, the seed command can be included temporarily in the build command:

```text
npm ci && npm run prisma:generate && npm run prisma:deploy && npm run prisma:seed && npm run build
```

After the first successful seeded deployment, remove `npm run prisma:seed` and deploy again. Otherwise every later deployment will clear and recreate the database.

Verify:

```text
GET https://mini-erp-crm-operations-portal-efdf.onrender.com/health
```

Expected response status: `200`.

### Frontend service

Recommended Render settings:

```text
Root Directory: client
Build Command: npm ci && npm run build
Publish Directory: dist
```

Set the build-time environment variable:

```text
VITE_API_URL=https://mini-erp-crm-operations-portal-efdf.onrender.com/api
```

Because the application uses `BrowserRouter`, configure a Render static-site rewrite:

```text
Source: /*
Destination: /index.html
Action: Rewrite
```

Without this rule, `/` works but refreshing `/login`, `/dashboard`, or another client route returns `404 Not Found` before React starts. The repository also contains `client/public/_redirects`, which is included in the build output, but the Render dashboard rewrite is the authoritative configuration for this service.

## 12. Production Troubleshooting

### Login returns 401

A `401 Invalid credentials` response proves that the request reached the API. It is not a CORS error. Check these items:

1. The backend `DATABASE_URL` points to the intended production database.
2. The database migrations have been deployed.
3. The seed script has completed against that production database.
4. The frontend uses the expected email and password.
5. The backend was redeployed after changing environment variables.

### Frontend route returns 404 after refresh

This happens when the static host looks for a physical `/login` file instead of serving the React entry point. Add the Render rewrite from the frontend deployment section, redeploy, and hard-refresh the browser.

### CORS diagnosis

A browser CORS failure normally prevents the response from being exposed to JavaScript. In this project, the API returns an application-level `401` when credentials are wrong, and the preflight request returns `204` with an `Access-Control-Allow-Origin` header. That behavior confirms that the request is reaching the API and CORS is not the root cause.

### Local works but production fails

Local development uses Vite's proxy from `/api` to `http://localhost:5000`. Production uses the value compiled into the frontend from `VITE_API_URL`. Confirm that the production value ends in `/api` and points to the backend service, not the frontend service.

### Render build cannot run the seed command

Ensure `ts-node` is available to the production build. It is declared in the server dependencies because the Render seed command may run during a production install. Verify the build log contains the Prisma seed output before testing login.

## 13. Verification Evidence

The repository was verified with:

```powershell
cd server
npm run build
npm test -- --runInBand

cd ..\client
npm run build
```

Results:

- Backend TypeScript build: passed.
- Frontend Vite production build: passed.
- Jest integration suite: 15 tests passed, 0 failed.
- Authentication and invalid-password behavior: covered.
- RBAC authorization: covered.
- Customer and follow-up workflows: covered.
- Product and stock validation: covered.
- Challan snapshots: covered.
- Double confirmation protection: covered.
- Insufficient-stock atomic rollback: covered.

## 14. Security and Operations Notes

- Do not commit `.env` files, database credentials, JWT secrets, or production tokens.
- Use a strong production `JWT_SECRET` managed by Render environment variables.
- Use HTTPS for the deployed frontend and API.
- Demo credentials should be replaced or disabled for a real production rollout.
- The seed script is destructive and should not be part of recurring production deployments.
- Review token storage policy before using the portal with sensitive production data; the current frontend stores the JWT in browser local storage.
- Add database backups, monitoring, rate limiting, and a formal session policy before production business use.
