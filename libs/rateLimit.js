// Custom Modules
const redisClient = require('../config/redisConnection');
const { uuidGen, } = require('./utils');

// Check for the UUID otherwise generate a new one
const rateLimit = async (req, res, next) => {
    try {

        // Extract the cookie
        const uuid = req.cookies.id || 'none';

        const uuidInfo = await redisClient.get(uuid);

        // Check the presence of the UUID
        if (!uuidInfo) {

            // Generate a new UUID
            const newUuid = uuidGen();

            // Set the uuid data in req
            req.uuidData = {
                uuid: newUuid,
                requestCount: 1,
            };

            // Store the uuid and request count: exp = 1 min
            await redisClient.set(newUuid, 1, {
                EX: 60 * 1000,
            });

            // Set the cookie: exp = 1 min
            res.cookie('id', newUuid, {
                expires: new Date(Date.now() + 60 * 1000),
                httpOnly: true,
            });

            return next();
        }


        // If the rate limit is exceeded
        if (uuidInfo >= 2) {

            return res.status(429).json({
                message: 'Rate limit exceeded',
            });
        }

        // Increase the request count by 1
        const requestCount = await redisClient.incrBy(uuid, 1);

        // Set the uuid data in req
        req.uuidData = {
            uuid,
            requestCount,
        };

        return next();

    } catch (err) {

        console.log(err);
        return res.status(500).json({
            message: 'Server Error',
        });
    }
};

module.exports = rateLimit;