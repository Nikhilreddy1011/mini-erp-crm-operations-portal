import { z } from 'zod';
import { CustomerType, CustomerStatus } from '@prisma/client';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

export const customerSchema = z.object({
  customerName: z.string().min(2, 'Customer name is required'),
  mobileNumber: z.string().min(8, 'Mobile number is required'),
  email: z.string().email('Invalid email address'),
  businessName: z.string().min(2, 'Business name is required'),
  gstNumber: z.string().optional().nullable(),
  customerType: z.nativeEnum(CustomerType).default(CustomerType.RETAIL),
  address: z.string().min(5, 'Address is required'),
  status: z.nativeEnum(CustomerStatus).default(CustomerStatus.LEAD),
  followUpDate: z.string().optional().nullable(),
  notes: z.string().optional().nullable()
});

export const customerUpdateSchema = customerSchema.partial();

export const followUpSchema = z.object({
  note: z.string().min(2, 'Follow-up note is required'),
  followUpDate: z.string().optional().nullable()
});

export const productSchema = z.object({
  name: z.string().min(2, 'Product name is required'),
  sku: z.string().min(2, 'SKU is required'),
  category: z.string().min(2, 'Category is required'),
  unitPrice: z.number().positive('Unit price must be greater than 0'),
  currentStock: z.number().int().nonnegative('Stock cannot be negative').default(0),
  minimumStockAlertQuantity: z.number().int().nonnegative().default(10),
  warehouseLocation: z.string().min(2, 'Warehouse location is required')
});

export const productUpdateSchema = productSchema.partial();

export const stockAdjustmentSchema = z.object({
  quantity: z.number().int().positive('Quantity must be greater than 0'),
  reason: z.string().min(2, 'Reason is required')
});

export const challanItemSchema = z.object({
  productId: z.string().uuid('Valid product ID required'),
  quantity: z.number().int().positive('Quantity must be greater than 0')
});

export const createChallanSchema = z.object({
  customerId: z.string().uuid('Valid customer ID required'),
  items: z.array(challanItemSchema).min(1, 'Challan must contain at least one item')
});
