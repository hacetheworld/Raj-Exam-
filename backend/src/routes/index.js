import { Router } from 'express';
import healthRoutes from './health.routes.js';
import digestRoutes from './digest.routes.js';
import bannerRoutes from './banner.routes.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(healthRoutes);
router.use(requireAuth);
router.use(digestRoutes);
router.use(bannerRoutes);

export default router;
