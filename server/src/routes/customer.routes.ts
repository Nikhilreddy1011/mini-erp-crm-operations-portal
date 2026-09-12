import { Router } from 'express';
import { CustomerController } from '../controllers/customer.controller';
import { authenticate, authorize } from '../middleware/auth';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate);

router.get(
  '/',
  authorize([Role.ADMIN, Role.SALES, Role.ACCOUNTS]),
  CustomerController.getCustomers
);

router.post(
  '/',
  authorize([Role.ADMIN, Role.SALES]),
  CustomerController.createCustomer
);

router.get(
  '/:id',
  authorize([Role.ADMIN, Role.SALES, Role.ACCOUNTS]),
  CustomerController.getCustomerById
);

router.put(
  '/:id',
  authorize([Role.ADMIN, Role.SALES]),
  CustomerController.updateCustomer
);

router.post(
  '/:id/follow-ups',
  authorize([Role.ADMIN, Role.SALES]),
  CustomerController.addFollowUp
);

export default router;
