// Custom Modules
const asyncHandler = require('../libs/asyncHandler');
const { trustFactor, } = require('../libs/trust');
const { trustFactorDataPreprocessing, getSteamId, } = require('../libs/apiCalls');

// DB
const { Player_DB, } = require('../config/dbConnection');

// @desc Get the trust factor of a player
// @route POST /trust
// @access Public
const computeTrust = asyncHandler(async (req, res, next) => {

    // Get the profile url
    const { profileUrl, } = req.body;

    // Get steam id of the user from the profile url
    const steamId = await getSteamId(profileUrl);

    // Preprocess the data
    const processedData = await trustFactorDataPreprocessing(steamId);

    // Calculate the trust factor
    const trustFactorValue = await trustFactor(processedData);

    // Add trust factor to the processed data
    processedData.trustFactor = trustFactorValue;

    // Save to the database
    const result = await Player_DB.findOneAndUpdate({ steamid: steamId, }, processedData, { new: true, upsert: true, });

    res.status(200).json(result);
});

module.exports = { computeTrust, };