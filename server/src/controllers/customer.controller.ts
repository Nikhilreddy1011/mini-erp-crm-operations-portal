import { Response, NextFunction } from 'express';
import { CustomerService } from '../services/customer.service';
import { customerSchema, customerUpdateSchema, followUpSchema } from '../validators';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../types';

export class CustomerController {
  static async getCustomers(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { customers, pagination } = await CustomerService.getCustomers(req.query as any);
      return sendSuccess(res, customers, 'Customers retrieved successfully', 200, pagination);
    } catch (error) {
      next(error);
    }
  }

  static async getCustomerById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const customer = await CustomerService.getCustomerById(req.params.id as string);
      return sendSuccess(res, customer, 'Customer details retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async createCustomer(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const validated = customerSchema.parse(req.body);
      const customer = await CustomerService.createCustomer(validated, req.user!.id);
      return sendSuccess(res, customer, 'Customer created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async updateCustomer(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const validated = customerUpdateSchema.parse(req.body);
      const customer = await CustomerService.updateCustomer(req.params.id as string, validated);
      return sendSuccess(res, customer, 'Customer updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async addFollowUp(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const validated = followUpSchema.parse(req.body);
      const followUp = await CustomerService.addFollowUp(
        req.params.id as string,
        validated.note,
        validated.followUpDate,
        req.user!.id
      );
      return sendSuccess(res, followUp, 'Follow-up note added successfully', 201);
    } catch (error) {
      next(error);
    }
  }
}
