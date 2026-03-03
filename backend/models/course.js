const mongoose = require("mongoose");

// Course Schema
const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    courseObjective: { type: String, required: true },


    modules: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Module' }],

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    tags: [{ type: String }],

  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Course", courseSchema);