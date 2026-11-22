import { asyncHandler } from '../utils/asyncHandler.js';
import * as marketService from '../services/market.service.js';

export const getQuote = asyncHandler(async (req, res) => {
  const data = await marketService.getQuoteBySymbol(req.params.symbol);

  res.status(200).json({
    success: true,
    data,
  });
});

export const getHistory = asyncHandler(async (req, res) => {
  const days = Math.min(Number(req.query.days) || 30, 365);
  const data = await marketService.getHistoricalSeries(req.params.symbol, days);

  res.status(200).json({
    success: true,
    data,
  });
});