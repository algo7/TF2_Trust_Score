// Dependencies
const { Schema, } = require('mongoose');

// Create User Schema
const PlayerSchema = new Schema({

    lastUpdated: {
        type: Date,
        required: true,
        default: Date.now(),
    },

}, {
    collection: 'Players',
    timestamps: true,
});

// Err Handling Middleware
PlayerSchema.post('save', (error, doc, next) => {
    if (error.name === 'MongoServerError' && error.code === 11000) {
        next(`Duplicate ${Object.keys(error.keyValue)[0]}`);
    } else {
        next();
    }
});

module.exports = { PlayerSchema, };

// Validation Doc: https://mongoosejs.com/docs/validation.html