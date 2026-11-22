import { Router } from 'express';
import { getQuote, getHistory } from '../controllers/market.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(protect);

router.get('/quote/:symbol', getQuote);
router.get('/history/:symbol', getHistory);

export default router;