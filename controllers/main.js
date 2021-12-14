// Custom Modules
const asyncHandler = require('../libs/asyncHandler');

// @desc Allow the admin to get all the reported conversations
// @route DELETE /admin/interest/delete
// @access Private
const adminDeletePassion = asyncHandler(async (req, res, next) => {

    res.status(200).json({ msg: 'ok', });

    if (!1) {
        return next('x');
    }

});

module.exports = adminDeletePassion;