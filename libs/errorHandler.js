// Error handling middleware
// eslint-disable-next-line no-unused-vars
const errorHandler = async (err, req, res, next) => {

    if (err.logStack === false) {
        return res
            .status(err.statusCode || 500)
            .json({ msg: err.message || 'Server Error', });

    }

    console.log(err);

    return res
        .status(err.statusCode || 500)
        .json({ msg: err.message || 'Server Error', });

};

module.exports = errorHandler;