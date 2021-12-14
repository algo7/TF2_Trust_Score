// Custom Modules
const asyncHandler = require('../libs/asyncHandler');
const { trustFactor, } = require('../libs/trust');
const { trustFactorDataPreprocessing, } = require('../libs/apiCalls');

// DB
const { Player_DB, } = require('../config/dbConnection');

// @desc Get the trust factor of a player
// @route POST /trust
// @access Public
const computeTrust = asyncHandler(async (req, res, next) => {

    const { profileUrl, } = req.body;

    const processedData = await trustFactorDataPreprocessing(profileUrl);
    const trustFactorValue = await trustFactor(processedData);

    processedData.trustFactor = trustFactorValue;

    res.status(200).json(processedData);
});

module.exports = { computeTrust, };