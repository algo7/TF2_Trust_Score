// Dependencies
const express = require('express');
const router = express.Router();

// Controllers
const { computeTrust, computeTrustId, computTrustBulk, } = require('../controllers/main');

// Get the trust factor of a user via profile url
router.get('/trust', computeTrust);

// Get the trust factor of a user via steam id
router.get('/trust/user/:steamId', computeTrustId);

// Get the trust factor of a player's friends
router.get('/trust/bulk', computTrustBulk);


// Export the Module
module.exports = router;