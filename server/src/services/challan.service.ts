import { ChallanStatus, MovementType, Prisma } from '@prisma/client';
import { prisma } from '../utils/prisma';

export class ChallanService {
  private static async generateChallanNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `SC-${year}-`;

    const lastChallan = await prisma.salesChallan.findFirst({
      where: { challanNumber: { startsWith: prefix } },
      orderBy: { createdAt: 'desc' }
    });

    let nextSeq = 1;
    if (lastChallan) {
      const parts = lastChallan.challanNumber.split('-');
      if (parts.length === 3) {
        nextSeq = parseInt(parts[2], 10) + 1;
      }
    }

    return `${prefix}${nextSeq.toString().padStart(6, '0')}`;
  }

  static async getChallans(query: {
    search?: string;
    status?: ChallanStatus;
    customerId?: string;
    page?: number;
    limit?: number;
  }) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.SalesChallanWhereInput = {};

    if (query.search) {
      where.OR = [
        { challanNumber: { contains: query.search, mode: 'insensitive' } },
        { customer: { customerName: { contains: query.search, mode: 'insensitive' } } }
      ];
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.customerId) {
      where.customerId = query.customerId;
    }

    const [challans, total] = await Promise.all([
      prisma.salesChallan.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: { select: { id: true, customerName: true, businessName: true } },
          creator: { select: { id: true, name: true, email: true } },
          items: true
        }
      }),
      prisma.salesChallan.count({ where })
    ]);

    return {
      challans,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  static async getChallanById(id: string) {
    const challan = await prisma.salesChallan.findUnique({
      where: { id },
      include: {
        customer: true,
        creator: { select: { id: true, name: true, email: true, role: true } },
        items: true
      }
    });

    if (!challan) {
      throw { statusCode: 404, message: 'Sales Challan not found' };
    }

    return challan;
  }

  static async createDraftChallan(
    data: { customerId: string; items: { productId: string; quantity: number }[] },
    userId: string
  ) {
    const customer = await prisma.customer.findUnique({
      where: { id: data.customerId }
    });

    if (!customer) {
      throw { statusCode: 404, message: 'Customer not found' };
    }

    // Fetch product details for snapshot
    const productIds = data.items.map((i) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } }
    });

    if (products.length !== productIds.length) {
      throw { statusCode: 400, message: 'One or more selected products do not exist' };
    }

    const productMap = new Map(products.map((p) => [p.id, p]));
    const challanNumber = await this.generateChallanNumber();

    let totalQuantity = 0;
    const itemsToCreate = data.items.map((item) => {
      const prod = productMap.get(item.productId)!;
      totalQuantity += item.quantity;
      const lineTotal = prod.unitPrice * item.quantity;

      return {
        productId: prod.id,
        productNameSnapshot: prod.name,
        skuSnapshot: prod.sku,
        unitPriceSnapshot: prod.unitPrice,
        quantity: item.quantity,
        lineTotal
      };
    });

    return prisma.salesChallan.create({
      data: {
        challanNumber,
        customerId: data.customerId,
        totalQuantity,
        status: ChallanStatus.DRAFT,
        createdBy: userId,
        items: {
          create: itemsToCreate
        }
      },
      include: {
        customer: true,
        items: true
      }
    });
  }

  static async confirmChallan(id: string, userId: string) {
    const challan = await prisma.salesChallan.findUnique({
      where: { id },
      include: { items: true }
    });

    if (!challan) {
      throw { statusCode: 404, message: 'Sales Challan not found' };
    }

    if (challan.status === ChallanStatus.CONFIRMED) {
      throw { statusCode: 400, message: 'Challan is already confirmed' };
    }

    if (challan.status === ChallanStatus.CANCELLED) {
      throw { statusCode: 400, message: 'Cannot confirm a cancelled challan' };
    }

    // MANDATORY SINGLE PRISMA TRANSACTION
    return prisma.$transaction(async (tx) => {
      // 1. Check current stock for EVERY product
      for (const item of challan.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId }
        });

        if (!product) {
          throw {
            statusCode: 404,
            message: `Product ${item.productNameSnapshot} (SKU: ${item.skuSnapshot}) no longer exists`
          };
        }

        if (product.currentStock < item.quantity) {
          throw {
            statusCode: 400,
            message: `Insufficient stock for product '${product.name}' (SKU: ${product.sku}). Available: ${product.currentStock}, Requested: ${item.quantity}`
          };
        }
      }

      // 2. Reduce stock for every product and create OUT stock movement
      for (const item of challan.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { currentStock: { decrement: item.quantity } }
        });

        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            quantityChanged: item.quantity,
            movementType: MovementType.OUT,
            reason: `Challan Confirmation ${challan.challanNumber}`,
            createdBy: userId
          }
        });
      }

      // 3. Update Challan status to CONFIRMED
      const updatedChallan = await tx.salesChallan.update({
        where: { id },
        data: { status: ChallanStatus.CONFIRMED },
        include: { customer: true, items: true }
      });

      return updatedChallan;
    });
  }

  static async cancelChallan(id: string) {
    const challan = await prisma.salesChallan.findUnique({
      where: { id }
    });

    if (!challan) {
      throw { statusCode: 404, message: 'Sales Challan not found' };
    }

    if (challan.status === ChallanStatus.CONFIRMED) {
      throw { statusCode: 400, message: 'Cannot cancel an already confirmed sales challan' };
    }

    if (challan.status === ChallanStatus.CANCELLED) {
      throw { statusCode: 400, message: 'Challan is already cancelled' };
    }

    return prisma.salesChallan.update({
      where: { id },
      data: { status: ChallanStatus.CANCELLED },
      include: { customer: true, items: true }
    });
  }

  static async updateDraftChallan(
    id: string,
    data: { customerId?: string; items?: { productId: string; quantity: number }[] }
  ) {
    const challan = await prisma.salesChallan.findUnique({
      where: { id },
      include: { items: true }
    });

    if (!challan) {
      throw { statusCode: 404, message: 'Sales Challan not found' };
    }

    if (challan.status !== ChallanStatus.DRAFT) {
      throw { statusCode: 400, message: 'Only draft challans can be edited' };
    }

    return prisma.$transaction(async (tx) => {
      let totalQuantity = challan.totalQuantity;

      if (data.items) {
        // Delete existing items
        await tx.salesChallanItem.deleteMany({ where: { challanId: id } });

        const productIds = data.items.map((i) => i.productId);
        const products = await tx.product.findMany({ where: { id: { in: productIds } } });
        const productMap = new Map(products.map((p) => [p.id, p]));

        totalQuantity = 0;
        const itemsToCreate = data.items.map((item) => {
          const prod = productMap.get(item.productId)!;
          totalQuantity += item.quantity;
          return {
            challanId: id,
            productId: prod.id,
            productNameSnapshot: prod.name,
            skuSnapshot: prod.sku,
            unitPriceSnapshot: prod.unitPrice,
            quantity: item.quantity,
            lineTotal: prod.unitPrice * item.quantity
          };
        });

        await tx.salesChallanItem.createMany({ data: itemsToCreate });
      }

      return tx.salesChallan.update({
        where: { id },
        data: {
          customerId: data.customerId || challan.customerId,
          totalQuantity
        },
        include: { customer: true, items: true }
      });
    });
  }
}
