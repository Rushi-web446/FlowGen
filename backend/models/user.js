const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    auth0Id: {
      type: String,
      unique: true,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    courses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],
  },
  {
    /* 
    mongoose maintains createdAt and updatedAt both.
    When inserted both set but after creation on every "update" only updateAt will change.

    Why this added differently because this is matadata about Schema not data.
    */
    timestamps: true, 
  },
);

const User = mongoose.model("User", userSchema);
module.exports = User;
