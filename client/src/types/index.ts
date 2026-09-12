export type Role = 'ADMIN' | 'SALES' | 'WAREHOUSE' | 'ACCOUNTS';
export type CustomerType = 'RETAIL' | 'WHOLESALE' | 'DISTRIBUTOR';
export type CustomerStatus = 'LEAD' | 'ACTIVE' | 'INACTIVE';
export type MovementType = 'IN' | 'OUT';
export type ChallanStatus = 'DRAFT' | 'CONFIRMED' | 'CANCELLED';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface Customer {
  id: string;
  customerName: string;
  mobileNumber: string;
  email: string;
  businessName: string;
  gstNumber?: string;
  customerType: CustomerType;
  address: string;
  status: CustomerStatus;
  followUpDate?: string;
  notes?: string;
  createdBy: string;
  creator?: { id: string; name: string; email: string };
  createdAt: string;
  updatedAt: string;
  followUps?: CustomerFollowUp[];
  challans?: SalesChallan[];
}

export interface CustomerFollowUp {
  id: string;
  customerId: string;
  note: string;
  followUpDate?: string;
  createdBy: string;
  creator?: { id: string; name: string };
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  unitPrice: number;
  currentStock: number;
  minimumStockAlertQuantity: number;
  warehouseLocation: string;
  stockStatus?: 'IN STOCK' | 'LOW STOCK' | 'OUT OF STOCK';
  createdAt: string;
  updatedAt: string;
  stockMovements?: StockMovement[];
}

export interface StockMovement {
  id: string;
  productId: string;
  product?: { id: string; name: string; sku: string };
  quantityChanged: number;
  movementType: MovementType;
  reason: string;
  createdBy: string;
  creator?: { id: string; name: string };
  createdAt: string;
}

export interface SalesChallanItem {
  id: string;
  challanId: string;
  productId: string;
  productNameSnapshot: string;
  skuSnapshot: string;
  unitPriceSnapshot: number;
  quantity: number;
  lineTotal: number;
}

export interface SalesChallan {
  id: string;
  challanNumber: string;
  customerId: string;
  customer?: Customer;
  totalQuantity: number;
  status: ChallanStatus;
  createdBy: string;
  creator?: { id: string; name: string; email: string };
  createdAt: string;
  updatedAt: string;
  items: SalesChallanItem[];
}

export interface DashboardMetrics {
  customers: {
    total: number;
    active: number;
    lead: number;
  };
  products: {
    total: number;
    lowStock: number;
    outOfStock: number;
  };
  challans: {
    draft: number;
    confirmed: number;
  };
  recentChallans: SalesChallan[];
  recentStockMovements: StockMovement[];
}
