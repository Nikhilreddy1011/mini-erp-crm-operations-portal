import { CustomerType, CustomerStatus, Prisma } from '@prisma/client';
import { prisma } from '../utils/prisma';

export class CustomerService {
  static async getCustomers(query: {
    search?: string;
    status?: CustomerStatus;
    customerType?: CustomerType;
    page?: number;
    limit?: number;
  }) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.CustomerWhereInput = {};

    if (query.search) {
      where.OR = [
        { customerName: { contains: query.search, mode: 'insensitive' } },
        { businessName: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
        { mobileNumber: { contains: query.search, mode: 'insensitive' } }
      ];
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.customerType) {
      where.customerType = query.customerType;
    }

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          creator: {
            select: { id: true, name: true, email: true }
          }
        }
      }),
      prisma.customer.count({ where })
    ]);

    return {
      customers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  static async getCustomerById(id: string) {
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        creator: { select: { id: true, name: true, email: true } },
        followUps: {
          orderBy: { createdAt: 'desc' },
          include: { creator: { select: { id: true, name: true } } }
        },
        challans: {
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            challanNumber: true,
            totalQuantity: true,
            status: true,
            createdAt: true
          }
        }
      }
    });

    if (!customer) {
      throw { statusCode: 404, message: 'Customer not found' };
    }

    return customer;
  }

  static async createCustomer(data: any, userId: string) {
    const existing = await prisma.customer.findFirst({
      where: { email: data.email }
    });

    if (existing) {
      throw { statusCode: 409, message: 'Customer with this email already exists' };
    }

    return prisma.customer.create({
      data: {
        ...data,
        followUpDate: data.followUpDate ? new Date(data.followUpDate) : null,
        createdBy: userId
      }
    });
  }

  static async updateCustomer(id: string, data: any) {
    const customer = await prisma.customer.findUnique({ where: { id } });
    if (!customer) {
      throw { statusCode: 404, message: 'Customer not found' };
    }

    if (data.email && data.email !== customer.email) {
      const existing = await prisma.customer.findFirst({ where: { email: data.email } });
      if (existing) {
        throw { statusCode: 409, message: 'Email is already in use by another customer' };
      }
    }

    return prisma.customer.update({
      where: { id },
      data: {
        ...data,
        followUpDate: data.followUpDate !== undefined 
          ? (data.followUpDate ? new Date(data.followUpDate) : null) 
          : undefined
      }
    });
  }

  static async addFollowUp(customerId: string, note: string, followUpDate: string | null | undefined, userId: string) {
    const customer = await prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer) {
      throw { statusCode: 404, message: 'Customer not found' };
    }

    const nextFollowUpDate = followUpDate ? new Date(followUpDate) : null;

    const [followUp] = await prisma.$transaction([
      prisma.customerFollowUp.create({
        data: {
          customerId,
          note,
          followUpDate: nextFollowUpDate,
          createdBy: userId
        }
      }),
      prisma.customer.update({
        where: { id: customerId },
        data: { followUpDate: nextFollowUpDate }
      })
    ]);

    return followUp;
  }
}
