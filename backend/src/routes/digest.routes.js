import { Router } from 'express';
import { validateDateParam } from '../middleware/validate.js';
import { getDigest } from '../controllers/digest.controller.js';

const router = Router();

router.get('/digests/:date', validateDateParam, getDigest);

export default router;
