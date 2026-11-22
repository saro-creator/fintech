import { ApiError } from '../utils/apiError.js';

// Simple in-memory cache (TTL: 60 seconds)
const quoteCache = new Map();
const CACHE_TTL_MS = 60 * 1000;

// Fallback reference prices (development & offline testing ke liye)
const BASE_PRICES = {
  TCS: { name: 'Tata Consultancy Services Ltd.', price: 4120.5, currency: 'INR' },
  RELIANCE: { name: 'Reliance Industries Ltd.', price: 2985.0, currency: 'INR' },
  INFY: { name: 'Infosys Ltd.', price: 1840.25, currency: 'INR' },
  HDFCBANK: { name: 'HDFC Bank Ltd.', price: 1690.75, currency: 'INR' },
  AAPL: { name: 'Apple Inc.', price: 228.4, currency: 'USD' },
  BTC: { name: 'Bitcoin', price: 91500.0, currency: 'USD' },
  GOLD: { name: 'Gold ETF', price: 7650.0, currency: 'INR' },
};

export const getQuoteBySymbol = async (symbol) => {
  const cleanSymbol = symbol.toUpperCase().trim();
  if (!cleanSymbol) {
    throw new ApiError(400, 'Stock or asset symbol is required');
  }

  // 1. Cache check karein
  const cached = quoteCache.get(cleanSymbol);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return { ...cached.data, cached: true };
  }

  // 2. Simulated live market tick (+/- 1.5% realistic fluctuation)
  const asset = BASE_PRICES[cleanSymbol] || {
    name: `${cleanSymbol} Asset`,
    price: 1000.0,
    currency: 'INR',
  };

  const changePercent = Number(((Math.random() - 0.48) * 3).toFixed(2));
  const currentPrice = Number((asset.price * (1 + changePercent / 100)).toFixed(2));
  const dayChange = Number((currentPrice - asset.price).toFixed(2));

  const quoteData = {
    symbol: cleanSymbol,
    name: asset.name,
    currency: asset.currency,
    currentPrice,
    previousClose: asset.price,
    dayChange,
    changePercent,
    updatedAt: new Date().toISOString(),
  };

  quoteCache.set(cleanSymbol, { data: quoteData, timestamp: Date.now() });

  return { ...quoteData, cached: false };
};

export const getHistoricalSeries = async (symbol, days = 30) => {
  const quote = await getQuoteBySymbol(symbol);
  const series = [];
  let runningPrice = quote.currentPrice * 0.92;

  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);

    const step = (Math.random() - 0.47) * 0.025;
    runningPrice = i === 0 ? quote.currentPrice : Number((runningPrice * (1 + step)).toFixed(2));

    series.push({
      date: date.toISOString().split('T')[0],
      price: runningPrice,
    });
  }

  return {
    symbol: quote.symbol,
    currency: quote.currency,
    history: series,
  };
};