import mongoose from 'mongoose';

const holdingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    symbol: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    assetType: {
      type: String,
      enum: ['STOCK', 'MUTUAL_FUND', 'CRYPTO', 'COMMODITY'],
      default: 'STOCK',
    },
    totalQuantity: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    averageBuyPrice: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
      default: '0',
    },
  },
  { timestamps: true }
);

// Ek user ke paas ek symbol ki ek hi consolidated holding rahegi
holdingSchema.index({ userId: 1, symbol: 1 }, { unique: true });

export const Holding = mongoose.model('Holding', holdingSchema);