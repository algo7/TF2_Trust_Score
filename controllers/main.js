// Custom Modules
const asyncHandler = require('../libs/asyncHandler');

// @desc Allow the admin to get all the reported conversations
// @route DELETE /admin/interest/delete
// @access Private
const adminDeletePassion = asyncHandler(async (req, res) => {

    res.status(200).json({ msg: 'ok', });
});

module.exports = adminDeletePassion;