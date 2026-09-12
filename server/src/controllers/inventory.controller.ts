import { Response, NextFunction } from 'express';
import { ProductService } from '../services/product.service';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../types';

export class InventoryController {
  static async getStockMovements(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { movements, pagination } = await ProductService.getStockMovements(req.query as any);
      return sendSuccess(res, movements, 'Stock movements retrieved successfully', 200, pagination);
    } catch (error) {
      next(error);
    }
  }
}
