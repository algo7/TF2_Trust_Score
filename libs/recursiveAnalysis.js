// Custom Modules
const { trustFactorDataPreprocessing, getFriends, getSteamId, } = require('./apiCalls');
const { trustFactor, } = require('./trust');

// DB
const { Player_DB, } = require('../config/dbConnection');

/**
 * Analyze the trust factor of all of the player's friends
 * @param {String} profileUrl - The profile url of the player
 * @returns {Promise<Object> | Erro}
 */
const recursiveAnalaysis = async (profileUrl) => {
    try {

        // Get the steam id of the player
        const userSteamId = await getSteamId(profileUrl);

        // Get the friends of the player
        const friendList = await getFriends(userSteamId);

        // Extract the steam id of the player's friends
        const steamIds = friendList.map(friend => friend.steamid);

        // Bulk preprocess the data
        const analysisResults = await Promise.all(steamIds.map(async (id) => {

            // Preprocess the data
            const processedData = await trustFactorDataPreprocessing(id);

            // Calculate the trust factor
            const trustFactorValue = await trustFactor(processedData);

            // Add trust factor to the processed data
            processedData.trustFactor = trustFactorValue;

            return processedData;

        }));

        // Map the results to the mongodb schema
        const analysisResultsArray = analysisResults.map(result => ({
            updateOne: {
                filter: { steamid: result.steamid, },
                update: result,
                upsert: true,
            },
        }));

        // Bulk update the database
        const { result, } = await Player_DB.bulkWrite(analysisResultsArray, { ordered: false, });

        return result;

    } catch (err) {
        throw err;
    }

};

module.exports = recursiveAnalaysis;