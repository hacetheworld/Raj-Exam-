import { Router } from 'express';
import { getBanner } from '../controllers/banner.controller.js';

const router = Router();

router.get('/banner', getBanner);

export default router;
