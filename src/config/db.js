const mongoose = require('mongoose');
const { createClient } = require('redis');

const connectDB = async () => {
    try {

        const conn = await mongoose.connect(process.env.MONGO_URI);

        console.log(`MongoDB Connected: ${conn.connection.host}`);

    } catch (error) {

        console.error('MongoDB connection failed');
        console.error(error.message);

        process.exit(1);
    }
};

const redisClient = createClient({ url: process.env.REDIS_URL });

redisClient.on('connect', () => console.log('Redis Connected'));
redisClient.on('error', (err) => console.error(`Redis Error: ${err.message}`));

const connectRedis = async () => {
    await redisClient.connect();
};

module.exports = { connectDB, redisClient, connectRedis };