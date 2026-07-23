const mongoose = require("mongoose");
const env = require("./env");

const connectDB = async () => {
  try {
    console.log("\nConnecting to MongoDB...\n");
    const conn = await mongoose.connect(env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("MongoDB Connection Error:", error);
    process.exit(1);
  }
};

module.exports = connectDB;
