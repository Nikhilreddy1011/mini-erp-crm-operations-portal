import { Response, NextFunction } from 'express';
import { ProductService } from '../services/product.service';
import { productSchema, productUpdateSchema, stockAdjustmentSchema } from '../validators';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../types';

export class ProductController {
  static async getProducts(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { products, pagination } = await ProductService.getProducts(req.query as any);
      return sendSuccess(res, products, 'Products retrieved successfully', 200, pagination);
    } catch (error) {
      next(error);
    }
  }

  static async getProductById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const product = await ProductService.getProductById(req.params.id as string);
      return sendSuccess(res, product, 'Product details retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async createProduct(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const validated = productSchema.parse(req.body);
      const product = await ProductService.createProduct(validated, req.user!.id);
      return sendSuccess(res, product, 'Product created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async updateProduct(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const validated = productUpdateSchema.parse(req.body);
      const product = await ProductService.updateProduct(req.params.id as string, validated);
      return sendSuccess(res, product, 'Product updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async stockIn(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const validated = stockAdjustmentSchema.parse(req.body);
      const result = await ProductService.stockIn(
        req.params.id as string,
        validated.quantity,
        validated.reason,
        req.user!.id
      );
      return sendSuccess(res, result, 'Stock IN completed successfully');
    } catch (error) {
      next(error);
    }
  }

  static async stockOut(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const validated = stockAdjustmentSchema.parse(req.body);
      const result = await ProductService.stockOut(
        req.params.id as string,
        validated.quantity,
        validated.reason,
        req.user!.id
      );
      return sendSuccess(res, result, 'Stock OUT completed successfully');
    } catch (error) {
      next(error);
    }
  }
}
