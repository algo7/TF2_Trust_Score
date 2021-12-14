// Custom Modules
const { trustFactorDataPreprocessing, getFriends, getSteamId, } = require('./apiCalls');
const { trustFactor, } = require('./trust');

// DB
const { Player_DB, } = require('../config/dbConnection');

const recursiveAnalaysis = async (profileUrl) => {

    const userSteamId = await getSteamId(profileUrl);
    const friendList = await getFriends(userSteamId);
    const steamIds = friendList.map(friend => friend.steamid);

    const analysisResults = await Promise.all(steamIds.map(async (id) => {

        // Preprocess the data
        const processedData = await trustFactorDataPreprocessing(id);

        // Calculate the trust factor
        const trustFactorValue = await trustFactor(processedData);

        // Add trust factor to the processed data
        processedData.trustFactor = trustFactorValue;

        return processedData;

    }));

    const analysisResultsArray = analysisResults.map(result => ({
        updateOne: {
            filter: { steamid: result.steamid, },
            update: result,
            upsert: true,
        },
    }));
    const { result, } = await Player_DB.bulkWrite(analysisResultsArray, { ordered: false, });
    console.log(result);

};

module.exports = recursiveAnalaysis;