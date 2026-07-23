const mongoose = require("mongoose");

const knowledgeSourceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null, index: true },
  scope: { type: String, enum: ["CURATED", "USER_NOTE"], required: true },
  title: { type: String, required: true, trim: true },
  url: { type: String, trim: true, default: null },
  content: { type: String, required: true },
  tags: [{ type: String, trim: true }],
  embedding: { type: [Number], default: [] },
}, { timestamps: true });

knowledgeSourceSchema.index({ scope: 1, userId: 1 });
module.exports = mongoose.model("KnowledgeSource", knowledgeSourceSchema);
