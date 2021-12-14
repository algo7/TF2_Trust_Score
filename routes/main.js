// Dependencies
const express = require('express');
const router = express.Router();

// Controllers
const { computeTrust, } = require('../controllers/main');

// Get all the db contents
router.post('/trust', computeTrust);


// Export the Module
module.exports = router;