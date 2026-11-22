import { Router } from 'express';
import { z } from 'zod';
import { addTransaction, getSummary, getTransactions } from '../controllers/portfolio.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';

const router = Router();

const transactionSchema = z.object({
  body: z.object({
    symbol: z.string().min(1, 'Symbol is required').max(20),
    assetType: z.enum(['STOCK', 'MUTUAL_FUND', 'CRYPTO', 'COMMODITY']).optional(),
    type: z.enum(['BUY', 'SELL']),
    quantity: z.number().positive('Quantity must be greater than 0'),
    pricePerUnit: z.number().positive('Price must be greater than 0'),
    transactionDate: z.string().optional(),
  }),
});

// Saare portfolio routes protected hain (login zaroori hai)
router.use(protect);

router.post('/transactions', validate(transactionSchema), addTransaction);
router.get('/transactions', getTransactions);
router.get('/summary', getSummary);

export default router;