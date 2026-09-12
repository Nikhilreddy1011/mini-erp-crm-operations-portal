import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { loginSchema } from '../validators';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../types';

export class AuthController {
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = loginSchema.parse(req.body);
      const result = await AuthService.login(validated.email, validated.password);
      return sendSuccess(res, result, 'Login successful');
    } catch (error) {
      next(error);
    }
  }

  static async getMe(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const user = await AuthService.getMe(userId);
      return sendSuccess(res, user, 'User profile fetched successfully');
    } catch (error) {
      next(error);
    }
  }
}
