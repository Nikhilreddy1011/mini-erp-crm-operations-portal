import { MovementType, Prisma } from '@prisma/client';
import { prisma } from '../utils/prisma';

export class ProductService {
  static async getProducts(query: {
    search?: string;
    category?: string;
    page?: number;
    limit?: number;
  }) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {};

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { sku: { contains: query.search, mode: 'insensitive' } }
      ];
    }

    if (query.category) {
      where.category = query.category;
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.product.count({ where })
    ]);

    const formattedProducts = products.map((product) => {
      let stockStatus: 'IN STOCK' | 'LOW STOCK' | 'OUT OF STOCK' = 'IN STOCK';
      if (product.currentStock <= 0) {
        stockStatus = 'OUT OF STOCK';
      } else if (product.currentStock <= product.minimumStockAlertQuantity) {
        stockStatus = 'LOW STOCK';
      }

      return {
        ...product,
        stockStatus
      };
    });

    return {
      products: formattedProducts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  static async getProductById(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        stockMovements: {
          orderBy: { createdAt: 'desc' },
          include: { creator: { select: { id: true, name: true } } }
        }
      }
    });

    if (!product) {
      throw { statusCode: 404, message: 'Product not found' };
    }

    let stockStatus: 'IN STOCK' | 'LOW STOCK' | 'OUT OF STOCK' = 'IN STOCK';
    if (product.currentStock <= 0) {
      stockStatus = 'OUT OF STOCK';
    } else if (product.currentStock <= product.minimumStockAlertQuantity) {
      stockStatus = 'LOW STOCK';
    }

    return { ...product, stockStatus };
  }

  static async createProduct(data: any, userId: string) {
    const existingSku = await prisma.product.findUnique({
      where: { sku: data.sku }
    });

    if (existingSku) {
      throw { statusCode: 409, message: 'Product with this SKU already exists' };
    }

    return prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          name: data.name,
          sku: data.sku,
          category: data.category,
          unitPrice: data.unitPrice,
          currentStock: data.currentStock || 0,
          minimumStockAlertQuantity: data.minimumStockAlertQuantity || 10,
          warehouseLocation: data.warehouseLocation
        }
      });

      if (product.currentStock > 0) {
        await tx.stockMovement.create({
          data: {
            productId: product.id,
            quantityChanged: product.currentStock,
            movementType: MovementType.IN,
            reason: 'Initial stock',
            createdBy: userId
          }
        });
      }

      return product;
    });
  }

  static async updateProduct(id: string, data: any) {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      throw { statusCode: 404, message: 'Product not found' };
    }

    if (data.sku && data.sku !== product.sku) {
      const existing = await prisma.product.findUnique({ where: { sku: data.sku } });
      if (existing) {
        throw { statusCode: 409, message: 'SKU is already in use by another product' };
      }
    }

    return prisma.product.update({
      where: { id },
      data
    });
  }

  static async stockIn(productId: string, quantity: number, reason: string, userId: string) {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      throw { statusCode: 404, message: 'Product not found' };
    }

    return prisma.$transaction(async (tx) => {
      const updatedProduct = await tx.product.update({
        where: { id: productId },
        data: { currentStock: { increment: quantity } }
      });

      const movement = await tx.stockMovement.create({
        data: {
          productId,
          quantityChanged: quantity,
          movementType: MovementType.IN,
          reason,
          createdBy: userId
        }
      });

      return { product: updatedProduct, movement };
    });
  }

  static async stockOut(productId: string, quantity: number, reason: string, userId: string) {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      throw { statusCode: 404, message: 'Product not found' };
    }

    if (product.currentStock < quantity) {
      throw { statusCode: 400, message: 'Insufficient stock' };
    }

    return prisma.$transaction(async (tx) => {
      const updatedProduct = await tx.product.update({
        where: { id: productId },
        data: { currentStock: { decrement: quantity } }
      });

      const movement = await tx.stockMovement.create({
        data: {
          productId,
          quantityChanged: quantity,
          movementType: MovementType.OUT,
          reason,
          createdBy: userId
        }
      });

      return { product: updatedProduct, movement };
    });
  }

  static async getStockMovements(query: {
    productId?: string;
    movementType?: MovementType;
    page?: number;
    limit?: number;
  }) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.StockMovementWhereInput = {};

    if (query.productId) {
      where.productId = query.productId;
    }

    if (query.movementType) {
      where.movementType = query.movementType;
    }

    const [movements, total] = await Promise.all([
      prisma.stockMovement.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          product: { select: { id: true, name: true, sku: true } },
          creator: { select: { id: true, name: true } }
        }
      }),
      prisma.stockMovement.count({ where })
    ]);

    return {
      movements,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }
}
