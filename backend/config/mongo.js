const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!uri) {
      throw new Error("MONGO_URI not set in .env");
    }

    await mongoose.connect(uri, {
      dbName: "sportcms", 
    });

    console.log("MongoDB Connected Successfully 🚀");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
};

module.exports = connectDB;
