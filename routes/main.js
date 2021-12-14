// Dependencies
const express = require('express');
const router = express.Router();

// Controllers
const { computeTrust, computeTrustId, } = require('../controllers/main');

// Get the trust factor of a user via profile url
router.get('/trust', computeTrust);

// Get the trust factor of a user via steam id
router.get('/trust/:steamId', computeTrustId);


// Export the Module
module.exports = router;