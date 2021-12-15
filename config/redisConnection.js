// Dependencies
const redis = require('redis');

// Redis client options
const redisOptions = {
    host: '127.0.0.1',
    port: process.env.redisPort || '6379',
    password: undefined,
    retry_strategy: () => 1000,
};