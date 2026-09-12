import { Response, NextFunction } from 'express';
import { DashboardService } from '../services/dashboard.service';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../types';

export class DashboardController {
  static async getMetrics(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const metrics = await DashboardService.getMetrics();
      return sendSuccess(res, metrics, 'Dashboard metrics fetched successfully');
    } catch (error) {
      next(error);
    }
  }
}
