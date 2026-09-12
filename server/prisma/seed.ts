import { PrismaClient, Role, CustomerType, CustomerStatus, MovementType, ChallanStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clean existing data
  await prisma.salesChallanItem.deleteMany();
  await prisma.salesChallan.deleteMany();
  await prisma.stockMovement.deleteMany();
  await prisma.product.deleteMany();
  await prisma.customerFollowUp.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('Admin@123', 10);
  const salesPasswordHash = await bcrypt.hash('Sales@123', 10);
  const warehousePasswordHash = await bcrypt.hash('Warehouse@123', 10);
  const accountsPasswordHash = await bcrypt.hash('Accounts@123', 10);

  // 1. Create Users
  const adminUser = await prisma.user.create({
    data: {
      name: 'System Admin',
      email: 'admin@example.com',
      passwordHash,
      role: Role.ADMIN
    }
  });

  const salesUser = await prisma.user.create({
    data: {
      name: 'Sales Manager',
      email: 'sales@example.com',
      passwordHash: salesPasswordHash,
      role: Role.SALES
    }
  });

  const warehouseUser = await prisma.user.create({
    data: {
      name: 'Warehouse Manager',
      email: 'warehouse@example.com',
      passwordHash: warehousePasswordHash,
      role: Role.WAREHOUSE
    }
  });

  const accountsUser = await prisma.user.create({
    data: {
      name: 'Accounts Executive',
      email: 'accounts@example.com',
      passwordHash: accountsPasswordHash,
      role: Role.ACCOUNTS
    }
  });

  console.log('Users created:', { adminUser: adminUser.email, salesUser: salesUser.email, warehouseUser: warehouseUser.email, accountsUser: accountsUser.email });

  // 2. Create Customers
  const cust1 = await prisma.customer.create({
    data: {
      customerName: 'Acme Retailers Pvt Ltd',
      mobileNumber: '+919876543210',
      email: 'contact@acmeretail.com',
      businessName: 'Acme Supermart Chain',
      gstNumber: '27AABCU9603R1ZN',
      customerType: CustomerType.WHOLESALE,
      address: '102 Industrial Estate, Andheri East, Mumbai, Maharashtra 400069',
      status: CustomerStatus.ACTIVE,
      followUpDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      notes: 'Key enterprise wholesale buyer. Monthly orders around $50k.',
      createdBy: salesUser.id
    }
  });

  const cust2 = await prisma.customer.create({
    data: {
      customerName: 'Apex Electronics & Tools',
      mobileNumber: '+919123456789',
      email: 'purchasing@apexelectronics.in',
      businessName: 'Apex Trading Corp',
      gstNumber: '07AAACA1234A1Z5',
      customerType: CustomerType.DISTRIBUTOR,
      address: 'Plot 45, Okhla Industrial Area Phase III, New Delhi 110020',
      status: CustomerStatus.ACTIVE,
      followUpDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      notes: 'North region master distributor.',
      createdBy: salesUser.id
    }
  });

  const cust3 = await prisma.customer.create({
    data: {
      customerName: 'Metro Hardware Stores',
      mobileNumber: '+919988776655',
      email: 'info@metrohardware.org',
      businessName: 'Metro Retail',
      customerType: CustomerType.RETAIL,
      address: 'Shop 12, MG Road, Bengaluru, Karnataka 560001',
      status: CustomerStatus.LEAD,
      followUpDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      notes: 'Interested in bulk power tools sample order.',
      createdBy: salesUser.id
    }
  });

  // Follow-ups
  await prisma.customerFollowUp.create({
    data: {
      customerId: cust1.id,
      note: 'Initial contract discussion completed. Sent product catalog.',
      followUpDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      createdBy: salesUser.id
    }
  });

  await prisma.customerFollowUp.create({
    data: {
      customerId: cust1.id,
      note: 'Negotiated wholesale discount rates. Customer agreed to 60-day credit terms.',
      followUpDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      createdBy: salesUser.id
    }
  });

  // 3. Create Products
  const prod1 = await prisma.product.create({
    data: {
      name: 'Heavy Duty Ergonomic Laptop Stand',
      sku: 'PROD-LS-001',
      category: 'Office Ergonomics',
      unitPrice: 1250.00,
      currentStock: 100,
      minimumStockAlertQuantity: 15,
      warehouseLocation: 'Rack A-04'
    }
  });

  const prod2 = await prisma.product.create({
    data: {
      name: 'Wireless Mechanical Keyboard RGB',
      sku: 'PROD-KB-002',
      category: 'Computer Accessories',
      unitPrice: 3499.00,
      currentStock: 50,
      minimumStockAlertQuantity: 10,
      warehouseLocation: 'Rack B-12'
    }
  });

  const prod3 = await prisma.product.create({
    data: {
      name: 'Precision Wireless Optical Mouse',
      sku: 'PROD-MS-003',
      category: 'Computer Accessories',
      unitPrice: 899.00,
      currentStock: 8, // Low stock!
      minimumStockAlertQuantity: 15,
      warehouseLocation: 'Rack B-14'
    }
  });

  const prod4 = await prisma.product.create({
    data: {
      name: 'USB-C Ultra Docking Station 11-in-1',
      sku: 'PROD-DK-004',
      category: 'Networking & Hubs',
      unitPrice: 4500.00,
      currentStock: 0, // Out of stock!
      minimumStockAlertQuantity: 5,
      warehouseLocation: 'Rack C-01'
    }
  });

  // Initial Stock Movements
  await prisma.stockMovement.createMany({
    data: [
      { productId: prod1.id, quantityChanged: 100, movementType: MovementType.IN, reason: 'Initial stock setup', createdBy: warehouseUser.id },
      { productId: prod2.id, quantityChanged: 50, movementType: MovementType.IN, reason: 'Initial stock setup', createdBy: warehouseUser.id },
      { productId: prod3.id, quantityChanged: 8, movementType: MovementType.IN, reason: 'Initial stock setup', createdBy: warehouseUser.id }
    ]
  });

  // 4. Create Sales Challans
  // Draft Challan
  await prisma.salesChallan.create({
    data: {
      challanNumber: 'SC-2026-000001',
      customerId: cust1.id,
      totalQuantity: 15,
      status: ChallanStatus.DRAFT,
      createdBy: salesUser.id,
      items: {
        create: [
          {
            productId: prod1.id,
            productNameSnapshot: prod1.name,
            skuSnapshot: prod1.sku,
            unitPriceSnapshot: prod1.unitPrice,
            quantity: 10,
            lineTotal: prod1.unitPrice * 10
          },
          {
            productId: prod2.id,
            productNameSnapshot: prod2.name,
            skuSnapshot: prod2.sku,
            unitPriceSnapshot: prod2.unitPrice,
            quantity: 5,
            lineTotal: prod2.unitPrice * 5
          }
        ]
      }
    }
  });

  // Confirmed Challan
  await prisma.salesChallan.create({
    data: {
      challanNumber: 'SC-2026-000002',
      customerId: cust2.id,
      totalQuantity: 20,
      status: ChallanStatus.CONFIRMED,
      createdBy: salesUser.id,
      items: {
        create: [
          {
            productId: prod1.id,
            productNameSnapshot: prod1.name,
            skuSnapshot: prod1.sku,
            unitPriceSnapshot: prod1.unitPrice,
            quantity: 20,
            lineTotal: prod1.unitPrice * 20
          }
        ]
      }
    }
  });

  console.log('Seed database completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
