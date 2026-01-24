const mongoose = require("mongoose");

const connectDB = async () => {
  console.log("\n\n\n\n  --> reaching :  backend/config/db.js . \n\n\n");
  try {
    console.log("\nConnecting to MongoDB...\n");
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("MongoDB Connection Error:", error);
    process.exit(1);
  }
};

module.exports = connectDB;