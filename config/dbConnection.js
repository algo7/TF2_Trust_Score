// Dependencies
const mongoose = require('mongoose');

// DB URI
const Mongo_Local_URI = 'mongodb://localhost:27017/ECHO';

// // Creds
// const { mongoURI, } = require('../../libs/credLoader');

// Require Models for DB
const { PlayerSchema, } = require('../models/Players');

// Connect to DB 
const DB_Connection = mongoose.createConnection(Mongo_Local_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Connect to the DB
DB_Connection
    .on('open', () => console.info('DB Connected'))
    .on('error', err => console.error('Error Connecting to DB' + ' ' + err));



// Load Models
const Player_DB = DB_Connection.model('player', PlayerSchema);



module.exports = {
    Player_DB,
};
