/**
 * Custom error response class
 * @extends Error - The native NodeJs error class
 */
class ErrorResponse extends Error {
    /**
   * Create a new error object
   * @param {String} message - The error message.
   * @param {Number} statusCode - The HTTP status code.
   * @param {Boolean} logStack - Log the stack trace or not.
   */
    constructor(message, statusCode, logStack) {
        // The message property from the vanilla Error object
        super(message);
        // Our custom status code
        this.statusCode = statusCode;
        // Log the stack trace or not
        this.logStack = logStack;
    }
}

// Export the class
module.exports = ErrorResponse;