import { CustomerStatus, ChallanStatus } from '@prisma/client';
import { prisma } from '../utils/prisma';

export class DashboardService {
  static async getMetrics() {
    const [
      totalCustomers,
      activeCustomers,
      leadCustomers,
      totalProducts,
      allProducts,
      draftChallans,
      confirmedChallans,
      recentChallans,
      recentStockMovements
    ] = await Promise.all([
      prisma.customer.count(),
      prisma.customer.count({ where: { status: CustomerStatus.ACTIVE } }),
      prisma.customer.count({ where: { status: CustomerStatus.LEAD } }),
      prisma.product.count(),
      prisma.product.findMany({ select: { currentStock: true, minimumStockAlertQuantity: true } }),
      prisma.salesChallan.count({ where: { status: ChallanStatus.DRAFT } }),
      prisma.salesChallan.count({ where: { status: ChallanStatus.CONFIRMED } }),
      prisma.salesChallan.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { customer: { select: { customerName: true } } }
      }),
      prisma.stockMovement.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { product: { select: { name: true, sku: true } }, creator: { select: { name: true } } }
      })
    ]);

    let lowStockProducts = 0;
    let outOfStockProducts = 0;

    for (const p of allProducts) {
      if (p.currentStock <= 0) {
        outOfStockProducts++;
      } else if (p.currentStock <= p.minimumStockAlertQuantity) {
        lowStockProducts++;
      }
    }

    return {
      customers: {
        total: totalCustomers,
        active: activeCustomers,
        lead: leadCustomers
      },
      products: {
        total: totalProducts,
        lowStock: lowStockProducts,
        outOfStock: outOfStockProducts
      },
      challans: {
        draft: draftChallans,
        confirmed: confirmedChallans
      },
      recentChallans,
      recentStockMovements
    };
  }
}
