import { Router } from 'express';
import { analyticsController } from './analytics.controller';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user.constant';

const router = Router();

router.get(
    '/overview',
    auth(USER_ROLE.OWNER), // Restrict to Owner/Admin only
    analyticsController.getAdminDashboardStats
);

router.get(
    '/export-orders',
    auth(USER_ROLE.OWNER),
    analyticsController.exportOrdersCSV
);

export const analyticsRouter = router;