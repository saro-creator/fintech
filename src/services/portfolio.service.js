import mongoose from 'mongoose';
import { Holding } from '../models/Holding.model.js';
import { Transaction } from '../models/Transaction.model.js';
import { ApiError } from '../utils/apiError.js';

export const recordTransaction = async (userId, { symbol, assetType, type, quantity, pricePerUnit, transactionDate }) => {
  const cleanSymbol = symbol.toUpperCase().trim();
  const qty = Number(quantity);
  const price = Number(pricePerUnit);

  let holding = await Holding.findOne({ userId, symbol: cleanSymbol });

  if (type === 'BUY') {
    if (!holding) {
      holding = await Holding.create({
        userId,
        symbol: cleanSymbol,
        assetType: assetType || 'STOCK',
        totalQuantity: qty,
        averageBuyPrice: mongoose.Types.Decimal128.fromString(price.toFixed(4)),
      });
    } else {
      const prevQty = holding.totalQuantity;
      const prevAvg = parseFloat(holding.averageBuyPrice.toString());

      // Weighted Average Buy Price formula
      const newTotalQty = prevQty + qty;
      const newAvgPrice = (prevQty * prevAvg + qty * price) / newTotalQty;

      holding.totalQuantity = newTotalQty;
      holding.averageBuyPrice = mongoose.Types.Decimal128.fromString(newAvgPrice.toFixed(4));
      await holding.save();
    }
  } else if (type === 'SELL') {
    if (!holding || holding.totalQuantity < qty) {
      throw new ApiError(
        400,
        `Insufficient quantity to sell. Available: ${holding ? holding.totalQuantity : 0}`
      );
    }

    holding.totalQuantity -= qty;
    await holding.save();
  }

  const transaction = await Transaction.create({
    userId,
    holdingId: holding._id,
    symbol: cleanSymbol,
    type,
    quantity: qty,
    pricePerUnit: mongoose.Types.Decimal128.fromString(price.toFixed(4)),
    ...(transactionDate && { transactionDate }),
  });

  return {
    holding: {
      id: holding._id,
      symbol: holding.symbol,
      assetType: holding.assetType,
      totalQuantity: holding.totalQuantity,
      averageBuyPrice: parseFloat(holding.averageBuyPrice.toString()),
    },
    transaction: {
      id: transaction._id,
      symbol: transaction.symbol,
      type: transaction.type,
      quantity: transaction.quantity,
      pricePerUnit: parseFloat(transaction.pricePerUnit.toString()),
      transactionDate: transaction.transactionDate,
    },
  };
};

export const getPortfolioSummary = async (userId) => {
  const holdings = await Holding.find({ userId, totalQuantity: { $gt: 0 } }).sort({ symbol: 1 });

  let totalInvested = 0;

  const formattedHoldings = holdings.map((h) => {
    const avgPrice = parseFloat(h.averageBuyPrice.toString());
    const investedValue = h.totalQuantity * avgPrice;
    totalInvested += investedValue;

    return {
      id: h._id,
      symbol: h.symbol,
      assetType: h.assetType,
      totalQuantity: h.totalQuantity,
      averageBuyPrice: Number(avgPrice.toFixed(2)),
      investedValue: Number(investedValue.toFixed(2)),
    };
  });

  return {
    totalInvested: Number(totalInvested.toFixed(2)),
    totalAssets: formattedHoldings.length,
    holdings: formattedHoldings,
  };
};

export const getUserTransactions = async (userId) => {
  const transactions = await Transaction.find({ userId }).sort({ transactionDate: -1, createdAt: -1 });

  return transactions.map((t) => ({
    id: t._id,
    symbol: t.symbol,
    type: t.type,
    quantity: t.quantity,
    pricePerUnit: parseFloat(t.pricePerUnit.toString()),
    totalAmount: Number((t.quantity * parseFloat(t.pricePerUnit.toString())).toFixed(2)),
    transactionDate: t.transactionDate,
  }));
};