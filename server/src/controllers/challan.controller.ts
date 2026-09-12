import { Response, NextFunction } from 'express';
import { ChallanService } from '../services/challan.service';
import { createChallanSchema } from '../validators';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../types';

export class ChallanController {
  static async getChallans(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { challans, pagination } = await ChallanService.getChallans(req.query as any);
      return sendSuccess(res, challans, 'Sales Challans retrieved successfully', 200, pagination);
    } catch (error) {
      next(error);
    }
  }

  static async getChallanById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const challan = await ChallanService.getChallanById(req.params.id as string);
      return sendSuccess(res, challan, 'Sales Challan details retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async createDraftChallan(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const validated = createChallanSchema.parse(req.body);
      const challan = await ChallanService.createDraftChallan(validated, req.user!.id);
      return sendSuccess(res, challan, 'Draft Sales Challan created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async updateDraftChallan(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const challan = await ChallanService.updateDraftChallan(req.params.id as string, req.body);
      return sendSuccess(res, challan, 'Draft Sales Challan updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async confirmChallan(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const challan = await ChallanService.confirmChallan(req.params.id as string, req.user!.id);
      return sendSuccess(res, challan, 'Sales Challan confirmed and inventory updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async cancelChallan(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const challan = await ChallanService.cancelChallan(req.params.id as string);
      return sendSuccess(res, challan, 'Sales Challan cancelled successfully');
    } catch (error) {
      next(error);
    }
  }
}
