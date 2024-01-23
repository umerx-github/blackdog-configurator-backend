import { Router } from 'express';
import seaDogDiscountSchemeRouter from './seaDogDiscountScheme.js';
const router = Router();
router.use('/seaDogDiscountScheme', seaDogDiscountSchemeRouter);
export default router;
