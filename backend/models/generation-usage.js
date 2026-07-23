const mongoose = require("mongoose");

const generationUsageSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null, index: true },
  feature: { type: String, required: true },
  provider: { type: String, required: true },
  model: { type: String, required: true },
  inputTokens: { type: Number, default: 0 },
  outputTokens: { type: Number, default: 0 },
  estimatedCostUsd: { type: Number, default: 0 },
  latencyMs: { type: Number, default: 0 },
  success: { type: Boolean, required: true },
  error: String,
}, { timestamps: true });

module.exports = mongoose.model("GenerationUsage", generationUsageSchema);
