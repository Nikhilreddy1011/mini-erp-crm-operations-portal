import request from 'supertest';
import app from '../app';
import { prisma } from '../utils/prisma';
import bcrypt from 'bcryptjs';
import { Role, MovementType, ChallanStatus } from '@prisma/client';

describe('MINI ERP + CRM Integration Test Suite', () => {
  let adminToken: string;
  let salesToken: string;
  let warehouseToken: string;
  let accountsToken: string;

  let testCustomerId: string;
  let prodAId: string;
  let prodBId: string;

  beforeAll(async () => {
    // Clean database
    await prisma.salesChallanItem.deleteMany();
    await prisma.salesChallan.deleteMany();
    await prisma.stockMovement.deleteMany();
    await prisma.product.deleteMany();
    await prisma.customerFollowUp.deleteMany();
    await prisma.customer.deleteMany();
    await prisma.user.deleteMany();

    const passwordHash = await bcrypt.hash('Password@123', 10);

    const admin = await prisma.user.create({
      data: { name: 'Admin', email: 'admin@test.com', passwordHash, role: Role.ADMIN }
    });

    const sales = await prisma.user.create({
      data: { name: 'Sales', email: 'sales@test.com', passwordHash, role: Role.SALES }
    });

    const warehouse = await prisma.user.create({
      data: { name: 'Warehouse', email: 'warehouse@test.com', passwordHash, role: Role.WAREHOUSE }
    });

    const accounts = await prisma.user.create({
      data: { name: 'Accounts', email: 'accounts@test.com', passwordHash, role: Role.ACCOUNTS }
    });

    // Obtain tokens
    const adminRes = await request(app).post('/api/auth/login').send({ email: 'admin@test.com', password: 'Password@123' });
    adminToken = adminRes.body.data.token;

    const salesRes = await request(app).post('/api/auth/login').send({ email: 'sales@test.com', password: 'Password@123' });
    salesToken = salesRes.body.data.token;

    const warehouseRes = await request(app).post('/api/auth/login').send({ email: 'warehouse@test.com', password: 'Password@123' });
    warehouseToken = warehouseRes.body.data.token;

    const accountsRes = await request(app).post('/api/auth/login').send({ email: 'accounts@test.com', password: 'Password@123' });
    accountsToken = accountsRes.body.data.token;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('1. AUTHENTICATION & RBAC', () => {
    test('Valid login returns token and user data without passwordHash', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'admin@test.com',
        password: 'Password@123'
      });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.passwordHash).toBeUndefined();
      expect(res.body.data.user.role).toBe('ADMIN');
    });

    test('Invalid password fails login', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'admin@test.com',
        password: 'WrongPassword'
      });
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    test('GET /api/auth/me with token succeeds', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${salesToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.email).toBe('sales@test.com');
    });

    test('GET /api/auth/me without token fails with 401', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
    });

    test('RBAC: Accounts user trying to create product gets 403 Forbidden', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${accountsToken}`)
        .send({
          name: 'Forbidden Test Product',
          sku: 'FORBIDDEN-01',
          category: 'General',
          unitPrice: 100,
          currentStock: 10,
          warehouseLocation: 'Loc'
        });
      expect(res.status).toBe(403);
    });
  });

  describe('2. CUSTOMERS & CRM', () => {
    test('Sales user creates a Customer', async () => {
      const res = await request(app)
        .post('/api/customers')
        .set('Authorization', `Bearer ${salesToken}`)
        .send({
          customerName: 'Global Distributors',
          mobileNumber: '+919876500000',
          email: 'info@globaldist.com',
          businessName: 'Global Dist Corp',
          customerType: 'WHOLESALE',
          address: '45 Trade Center',
          status: 'ACTIVE'
        });
      expect(res.status).toBe(201);
      expect(res.body.data.id).toBeDefined();
      testCustomerId = res.body.data.id;
    });

    test('Sales user adds follow-up note to Customer', async () => {
      const res = await request(app)
        .post(`/api/customers/${testCustomerId}/follow-ups`)
        .set('Authorization', `Bearer ${salesToken}`)
        .send({
          note: 'Discussed Q3 inventory terms'
        });
      expect(res.status).toBe(201);
      expect(res.body.data.note).toBe('Discussed Q3 inventory terms');
    });
  });

  describe('3. PRODUCTS & INVENTORY', () => {
    test('Warehouse user creates Product A (stock = 10) and Product B (stock = 5)', async () => {
      const resA = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${warehouseToken}`)
        .send({
          name: 'Product A',
          sku: 'PROD-A',
          category: 'Test Category',
          unitPrice: 100,
          currentStock: 10,
          minimumStockAlertQuantity: 2,
          warehouseLocation: 'Rack 1'
        });
      expect(resA.status).toBe(201);
      prodAId = resA.body.data.id;

      const resB = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${warehouseToken}`)
        .send({
          name: 'Product B',
          sku: 'PROD-B',
          category: 'Test Category',
          unitPrice: 200,
          currentStock: 5,
          minimumStockAlertQuantity: 2,
          warehouseLocation: 'Rack 2'
        });
      expect(resB.status).toBe(201);
      prodBId = resB.body.data.id;
    });

    test('Duplicate SKU fails with 409 Conflict', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${warehouseToken}`)
        .send({
          name: 'Duplicate SKU Product',
          sku: 'PROD-A',
          category: 'Test',
          unitPrice: 50,
          currentStock: 5,
          warehouseLocation: 'Loc'
        });
      expect(res.status).toBe(409);
    });

    test('Stock OUT greater than current stock fails with 400 Insufficient stock', async () => {
      const res = await request(app)
        .post(`/api/products/${prodBId}/stock-out`)
        .set('Authorization', `Bearer ${warehouseToken}`)
        .send({
          quantity: 20,
          reason: 'Excessive stock out'
        });
      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Insufficient stock');
    });
  });

  describe('4. SALES CHALLANS & CRITICAL TRANSACTIONAL CONSISTENCY', () => {
    let draftChallanId: string;

    test('Creating Draft Challan does NOT deduct stock', async () => {
      const res = await request(app)
        .post('/api/challans')
        .set('Authorization', `Bearer ${salesToken}`)
        .send({
          customerId: testCustomerId,
          items: [
            { productId: prodAId, quantity: 4 },
            { productId: prodBId, quantity: 2 }
          ]
        });
      expect(res.status).toBe(201);
      expect(res.body.data.status).toBe('DRAFT');
      expect(res.body.data.challanNumber).toMatch(/^SC-\d{4}-\d{6}$/);
      draftChallanId = res.body.data.id;

      // Verify stock remained unchanged
      const prodA = await prisma.product.findUnique({ where: { id: prodAId } });
      const prodB = await prisma.product.findUnique({ where: { id: prodBId } });
      expect(prodA?.currentStock).toBe(10);
      expect(prodB?.currentStock).toBe(5);
    });

    test('Product Snapshot information is correctly recorded on Challan items', async () => {
      const challan = await prisma.salesChallan.findUnique({
        where: { id: draftChallanId },
        include: { items: true }
      });
      expect(challan?.items[0].productNameSnapshot).toBe('Product A');
      expect(challan?.items[0].skuSnapshot).toBe('PROD-A');
      expect(challan?.items[0].unitPriceSnapshot).toBe(100);
    });

    test('Confirming Challan atomically reduces stock and creates OUT movements', async () => {
      const res = await request(app)
        .post(`/api/challans/${draftChallanId}/confirm`)
        .set('Authorization', `Bearer ${salesToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('CONFIRMED');

      // Verify stock reduced: A was 10 -> now 6 (10 - 4), B was 5 -> now 3 (5 - 2)
      const prodA = await prisma.product.findUnique({ where: { id: prodAId } });
      const prodB = await prisma.product.findUnique({ where: { id: prodBId } });
      expect(prodA?.currentStock).toBe(6);
      expect(prodB?.currentStock).toBe(3);

      // Verify OUT movements
      const movements = await prisma.stockMovement.findMany({
        where: { movementType: MovementType.OUT }
      });
      expect(movements.length).toBe(2);
    });

    test('Double Confirmation is forbidden', async () => {
      const res = await request(app)
        .post(`/api/challans/${draftChallanId}/confirm`)
        .set('Authorization', `Bearer ${salesToken}`);
      expect(res.status).toBe(400);
      expect(res.body.message).toContain('already confirmed');
    });

    test('MANDATORY CRITICAL TRANSACTION TEST: Insufficient stock rolls back ALL items', async () => {
      // Current stock: A = 6, B = 3.
      // Create a draft challan asking for A = 5 (sufficient) and B = 10 (insufficient).
      const draftRes = await request(app)
        .post('/api/challans')
        .set('Authorization', `Bearer ${salesToken}`)
        .send({
          customerId: testCustomerId,
          items: [
            { productId: prodAId, quantity: 5 },
            { productId: prodBId, quantity: 10 }
          ]
        });
      expect(draftRes.status).toBe(201);
      const invalidChallanId = draftRes.body.data.id;

      // Attempt confirmation -> MUST FAIL!
      const confirmRes = await request(app)
        .post(`/api/challans/${invalidChallanId}/confirm`)
        .set('Authorization', `Bearer ${salesToken}`);

      expect(confirmRes.status).toBe(400);
      expect(confirmRes.body.success).toBe(false);
      expect(confirmRes.body.message).toContain('Insufficient stock');

      // VERIFY COMPLETE ROLLBACK:
      // Product A stock MUST STILL BE 6 (not 1!)
      // Product B stock MUST STILL BE 3
      const prodA = await prisma.product.findUnique({ where: { id: prodAId } });
      const prodB = await prisma.product.findUnique({ where: { id: prodBId } });
      expect(prodA?.currentStock).toBe(6);
      expect(prodB?.currentStock).toBe(3);

      // Verify challan status remains DRAFT
      const challan = await prisma.salesChallan.findUnique({ where: { id: invalidChallanId } });
      expect(challan?.status).toBe('DRAFT');
    });
  });
});
