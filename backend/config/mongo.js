const mongoose = require("mongoose");

mongoose.set("bufferCommands", false); 

const connectDB = async () => {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;

  if (!uri) {
    process.exit(1);
  }

  try {
    await mongoose.connect(uri, {
      dbName: "sportcms",
      serverSelectionTimeoutMS: 5000, 
      socketTimeoutMS: 45000,
    });

  } catch (err) {
    console.error(err.message);

    setTimeout(connectDB, 5000);
  }
};

module.exports = connectDB;