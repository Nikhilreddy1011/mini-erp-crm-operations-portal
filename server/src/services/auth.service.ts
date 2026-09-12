import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma';
import { env } from '../config/env';
import { JwtPayload } from '../types';

export class AuthService {
  static async login(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      throw { statusCode: 401, message: 'Invalid credentials' };
    }

    if (!user.isActive) {
      throw { statusCode: 403, message: 'Account is deactivated' };
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw { statusCode: 401, message: 'Invalid credentials' };
    }

    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role
    };

    const token = jwt.sign(payload, env.JWT_SECRET as string, { expiresIn: env.JWT_EXPIRES_IN as any });

    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    return { token, user: userResponse };
  }

  static async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      throw { statusCode: 404, message: 'User not found' };
    }

    return user;
  }
}
