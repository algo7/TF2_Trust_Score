// Custom Modules
const asyncHandler = require('../libs/asyncHandler');
const bulkAnalysis = require('../libs/bulkAnalysis');
const { trustFactor, } = require('../libs/trust');
const { trustFactorDataPreprocessing, getSteamId, } = require('../libs/apiCalls');
const { uuidGen, } = require('../libs/utils');


// DB
const { Player_DB, } = require('../config/dbConnection');

// @desc Get the trust factor of a player via profile url
// @route GET /trust
// @access Public
const computeTrust = asyncHandler(async (req, res) => {

    // Get the profile url
    const { profileUrl, } = req.query;

    // Get steam id of the user from the profile url
    const steamId = await getSteamId(profileUrl);

    // Preprocess the data
    const processedData = await trustFactorDataPreprocessing(steamId);

    // Calculate the trust factor
    const trustFactorValue = await trustFactor(processedData);

    // Add trust factor to the processed data
    processedData.trustFactor = trustFactorValue;

    // Save to the database
    const result = await Player_DB
        .findOneAndUpdate({ steamid: steamId, }, processedData, { new: true, upsert: true, })
        .lean();

    // Set the cookie
    res.cookie('id', uuidGen(), {
        expires: new Date(Date.now() + 20 * 60 * 1000),
        httpOnly: true,
    });

    res.status(200).json(result);

});

// @desc Get the trust factor of a player via steam id
// @route GET /trust/user/:steamId'
// @access Public
const computeTrustId = asyncHandler(async (req, res) => {

    // Get the profile url
    const { steamId, } = req.params;

    // Preprocess the data
    const processedData = await trustFactorDataPreprocessing(steamId);

    // Calculate the trust factor
    const trustFactorValue = await trustFactor(processedData);

    // Add trust factor to the processed data
    processedData.trustFactor = trustFactorValue;

    // Save to the database
    const result = await Player_DB
        .findOneAndUpdate({ steamid: steamId, }, processedData, { new: true, upsert: true, })
        .lean();


    res.status(200).json(result);

});

// @desc Get the trust factor of a player's friends
// @route GET /trust/bulk
// @access Public
const computTrustBulk = asyncHandler(async (req, res) => {

    // Get the profile url
    const { profileUrl, } = req.query;

    // Perform bulk analysis
    const result = await bulkAnalysis(profileUrl);


    res.status(200).json(result);

});


module.exports = { computeTrust, computeTrustId, computTrustBulk, };