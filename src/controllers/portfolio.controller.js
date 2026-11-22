import { asyncHandler } from '../utils/asyncHandler.js';
import * as portfolioService from '../services/portfolio.service.js';

export const addTransaction = asyncHandler(async (req, res) => {
  const result = await portfolioService.recordTransaction(req.user._id, req.body);

  res.status(201).json({
    success: true,
    message: `${req.body.type} transaction recorded successfully`,
    data: result,
  });
});

export const getSummary = asyncHandler(async (req, res) => {
  const summary = await portfolioService.getPortfolioSummary(req.user._id);

  res.status(200).json({
    success: true,
    data: summary,
  });
});

export const getTransactions = asyncHandler(async (req, res) => {
  const transactions = await portfolioService.getUserTransactions(req.user._id);

  res.status(200).json({
    success: true,
    count: transactions.length,
    data: transactions,
  });
});