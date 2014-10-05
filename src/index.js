'use strict';
/**
 * Module dependencies.
 */
var init = require('./config/init')(),
    config = require('./config/config'),
    mongoose = require('mongoose-q')(),
    path = require('path');


// Bootstrap db connection
var db = mongoose.connect(config.db);

// Init the express application
var app = require('./config/express')(db);
// Init socket.io
var server = require('http').Server(app);

//require all routes
config.getGlobbedFiles('./routes/*.js').forEach(function(routePath) {
    require(path.resolve(routePath))(app);
});

// Start the app by listening on <port>
server.listen(config.port);


// Expose app
exports.app = app;

// Logging initialization
console.log('AdapTeach Auth service is running on port ' + config.port);