# Mini ERP + CRM Operations Portal Submission

## Links

| Item | Current value |
|---|---|
| GitHub repository | https://github.com/Nikhilreddy1011/mini-erp-crm-operations-portal |
| Live frontend | https://mini-erp-crm-operations-portal-1-14zw.onrender.com |
| Live backend API | https://mini-erp-crm-operations-portal-efdf.onrender.com |
| Backend health check | https://mini-erp-crm-operations-portal-efdf.onrender.com/health |
| Postman collection | [postman_collection.json](postman_collection.json) |
| Architecture and API documentation | [PROJECT_DOCUMENTATION.md](docs/PROJECT_DOCUMENTATION.md) and [CASE_STUDY.md](CASE_STUDY.md) |
| Setup and deployment instructions | [README.md](README.md) |

Cloud deployment requires publishing the repository and configuring the hosting provider credentials. The project is prepared for a static frontend host such as Vercel, Netlify, or Render Static Site; a Node backend host such as Render, Railway, or Fly.io; and PostgreSQL from Supabase, Neon, Render Postgres, or another compatible provider.

## Test Login Credentials

The following accounts are created by `npm run prisma:seed`:

| Role | Email | Password |
|---|---|---|
| ADMIN | admin@example.com | Admin@123 |
| SALES | sales@example.com | Sales@123 |
| WAREHOUSE | warehouse@example.com | Warehouse@123 |
| ACCOUNTS | accounts@example.com | Accounts@123 |

Use these credentials only in the seeded demo environment. Do not use them in production.

## API Collection

Import [postman_collection.json](postman_collection.json) into Postman. Its default API base is `http://localhost:5000/api`; change the `baseUrl` collection variable for a deployed backend.

The collection covers authentication, profile access, customer CRM, products, inventory movements, dashboard metrics, and sales challan workflows.

## Architecture Summary

- React 18 and Vite provide the responsive frontend.
- Express and TypeScript expose a controller and service-layer API.
- JWT authentication and role-based middleware enforce access for `ADMIN`, `SALES`, `WAREHOUSE`, and `ACCOUNTS`.
- PostgreSQL is accessed through Prisma ORM and migrations.
- Sales challan confirmation runs stock validation, stock deduction, movement logging, and status update inside one Prisma transaction.
- Product name, SKU, price, quantity, and line totals are snapshotted on challan items for historical accuracy.

## Verification

- Prisma schema validation: passed
- Server build: passed
- Client production build: passed
- PostgreSQL integration suite: 15 tests passed, 0 failed
- Critical insufficient-stock rollback test: passed

## Known Limitations

- The frontend and backend are deployed on Render using the production URLs listed above.
- The demo seed script clears existing application data before inserting demo records. Do not run it against production data.
- The frontend uses local storage for the JWT token; production deployments should use HTTPS and review token/session policy before exposing the application publicly.
- Cloud infrastructure is hosted on Render and Neon; backups, monitoring, custom domains, and CI/CD hardening are outside this submission scope.

## Cloud Publish Checklist

1. Create a GitHub repository and push this project.
2. Create a managed PostgreSQL database and set `DATABASE_URL`.
3. Deploy `server` with build command `npm ci && npm run prisma:generate && npm run prisma:deploy && npm run build` and start command `npm start`.
4. Set backend `CLIENT_URL` to the frontend URL and configure `JWT_SECRET` through the host secret manager.
5. Deploy `client` as a static site with `VITE_API_URL=https://<backend-host>/api`.
6. Configure SPA fallback to `index.html` and update the Postman `baseUrl` variable.
7. Run the health check, login checks for all roles, and the Postman collection against the deployed URLs.