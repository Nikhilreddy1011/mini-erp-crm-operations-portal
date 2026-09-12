import { Router } from 'express';
import { ChallanController } from '../controllers/challan.controller';
import { authenticate, authorize } from '../middleware/auth';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate);

router.get(
  '/',
  authorize([Role.ADMIN, Role.SALES, Role.WAREHOUSE, Role.ACCOUNTS]),
  ChallanController.getChallans
);

router.post(
  '/',
  authorize([Role.ADMIN, Role.SALES]),
  ChallanController.createDraftChallan
);

router.get(
  '/:id',
  authorize([Role.ADMIN, Role.SALES, Role.WAREHOUSE, Role.ACCOUNTS]),
  ChallanController.getChallanById
);

router.put(
  '/:id',
  authorize([Role.ADMIN, Role.SALES]),
  ChallanController.updateDraftChallan
);

router.post(
  '/:id/confirm',
  authorize([Role.ADMIN, Role.SALES]),
  ChallanController.confirmChallan
);

router.post(
  '/:id/cancel',
  authorize([Role.ADMIN, Role.SALES]),
  ChallanController.cancelChallan
);

export default router;
