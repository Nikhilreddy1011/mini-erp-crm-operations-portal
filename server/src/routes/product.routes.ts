import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';
import { authenticate, authorize } from '../middleware/auth';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate);

router.get(
  '/',
  authorize([Role.ADMIN, Role.SALES, Role.WAREHOUSE, Role.ACCOUNTS]),
  ProductController.getProducts
);

router.post(
  '/',
  authorize([Role.ADMIN, Role.WAREHOUSE]),
  ProductController.createProduct
);

router.get(
  '/:id',
  authorize([Role.ADMIN, Role.SALES, Role.WAREHOUSE, Role.ACCOUNTS]),
  ProductController.getProductById
);

router.put(
  '/:id',
  authorize([Role.ADMIN, Role.WAREHOUSE]),
  ProductController.updateProduct
);

router.post(
  '/:id/stock-in',
  authorize([Role.ADMIN, Role.WAREHOUSE]),
  ProductController.stockIn
);

router.post(
  '/:id/stock-out',
  authorize([Role.ADMIN, Role.WAREHOUSE]),
  ProductController.stockOut
);

export default router;
