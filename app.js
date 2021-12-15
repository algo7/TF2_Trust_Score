// Dependencies
const express = require('express');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const { routeCheck, } = require('express-suite');

// Custom Modules
const errorHandler = require('./libs/errorHandler');
const rateLimit = require('./libs/rateLimit');

// Global variables
const PORT = process.env.PORT || 9000;

// Initialize the App
const app = express();

// Compression Module
app.use(compression({ level: 9, memLevel: 9, }));

// Disable etag
app.set('etag', false);
app.set('x-powered-by', false);

// Express parser Middleware
app.use(express.urlencoded({
    extended: true,
    limit: '5mb',
}));

app.use(express.json({
    limit: '5mb',
    extended: true,
}));

app.use(express.text({
    limit: '5mb',
    extended: true,
}));

// Cookie parser
app.use(cookieParser());

// Ensure Auth
app.use(rateLimit);

/**
 * All routes go here
 */

// Load Routes
const Main = require('./routes/main');

// Use Routes
app.use('/', Main);

// Custom Error Handler
app.use(errorHandler);

// Route Check
app.use(routeCheck(app));

// Start the app
app.listen(PORT, () => {
    console.info(`Server is listening in ${process.env.NODE_ENV} on port ${PORT}`);
});



