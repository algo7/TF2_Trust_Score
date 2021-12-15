// Dependencies
const { createClient, } = require('redis');

// Redis client options
const redisOptions = {
    socket: {
        host: '127.0.0.1',
        port: 6379,
        reconnectStrategy: () => 1000,
    },
    username: '',
    password: '',
};

// Create the redis client
const redisClient = createClient(redisOptions);

redisClient.connect()
    .then(() => console.log('Redis Connected'))
    .catch(err => {
        console.log(err);
        process.exit(1);
    });


module.exports = redisClient;