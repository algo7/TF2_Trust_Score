// Custom Modules
const redisClient = require('../config/redisConnection');
const { uuidGen, } = require('./utils');

// Check for the UUID otherwise generate a new one
const rateLimit = async (req, res, next) => {
    try {

        // Connect to redis
        await redisClient.connect();

        // Extract the cookie
        const uuid = req.cookies.id || 'none';

        const uuidInfo = await redisClient.get(uuid);

        // Check the presence of the UUID
        if (!uuidInfo) {

            // Generate a new UUID
            const newUuid = uuidGen();

            req.uuidData = {
                uuid: newUuid,
                requestCount: 1,
            };

            // Store the uuid and request count
            await redisClient.set(newUuid, 1, {
                EX: 20 * 60 * 1000,
            });

            // Set the cookie
            res.cookie('id', newUuid, {
                expires: new Date(Date.now() + 20 * 60 * 1000),
                httpOnly: true,
            });

            // Close the connection
            await redisClient.quit();

            return next();
        }


        // Increase the request count by 1
        const requestCount = await redisClient.incrBy(uuid, 1);

        // Set the uuid in req
        req.uuidData = {
            uuid,
            requestCount,
        };


        // Close the connection
        await redisClient.quit();

        return next();

    } catch (err) {
        console.log(err);

        // Set the auth status
        req.uuidData = false;

        // Set the cookie to none and expire it in 5 sec
        res.cookie('id', 'none', {
            expires: new Date(Date.now() + 5 * 1000),
            httpOnly: true,
        });

        return next();
    }
};

module.exports = rateLimit;