import { Router } from 'express';
import { InventoryController } from '../controllers/inventory.controller';
import { authenticate, authorize } from '../middleware/auth';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate);

router.get(
  '/stock-movements',
  authorize([Role.ADMIN, Role.WAREHOUSE, Role.ACCOUNTS]),
  InventoryController.getStockMovements
);

export default router;
