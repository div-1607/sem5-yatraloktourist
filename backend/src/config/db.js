const mongoose = require('mongoose');

let mongod = null;

const connectDB = async () => {
  const primaryUri = process.env.MONGO_URI || 'mongodb://localhost:27017/yatralok';
  
  try {
    // Attempt standard connection with 1.5-second timeout
    await mongoose.connect(primaryUri, {
      serverSelectionTimeoutMS: 1500,
    });
    console.log(`[MongoDB] Connected successfully to primary URI: ${mongoose.connection.host}`);
    return true;
  } catch (err) {
    console.warn(`[MongoDB] Primary connection not detected (${err.message}).`);
    console.info(`[MongoDB] Starting high-performance In-Memory MongoDB engine...`);
    
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongod = await MongoMemoryServer.create();
      const memoryUri = mongod.getUri();
      
      await mongoose.connect(memoryUri);
      console.log(`[MongoDB] In-Memory MongoDB connected successfully at ${memoryUri}`);
      return true;
    } catch (memErr) {
      console.error(`[MongoDB] Could not start In-Memory MongoDB:`, memErr);
      process.exit(1);
    }
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongod) {
      await mongod.stop();
      mongod = null;
    }
  } catch (err) {
    console.error(`[MongoDB] Error disconnecting:`, err);
  }
};

process.on('SIGINT', async () => {
  await disconnectDB();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await disconnectDB();
  process.exit(0);
});

module.exports = { connectDB, disconnectDB };
