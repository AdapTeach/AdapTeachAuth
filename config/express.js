var express = require('express'),
    morgan = require('morgan'),
    bodyParser = require('body-parser'),
    compress = require('compression'),
    methodOverride = require('method-override'),
    config = require('./config'),
    path = require('path');

module.exports = function () {

    var app = express();

    app.use(function (req, res, next) {
        res.locals.url = req.protocol + ':// ' + req.headers.host + req.url;
        next();
    });

    app.use(compress({
        filter: function (req, res) {
            return (/json|text/).test(res.getHeader('Content-Type'));
        },
        level: 9
    }));

    // Showing stack errors
    app.set('showStackError', true);


    if (process.env.NODE_ENV === 'development') {
        app.use(morgan('dev'));
    } else if (process.env.NODE_ENV === 'production') {
        app.locals.cache = 'memory';
    }

    app.use(bodyParser.json());
//    app.use(bodyParser.urlencoded());
    app.use(methodOverride());

    app.disable('x-powered-by');

    app.use(require('cors')());


    config.getGlobbedFiles('./**/**/*.route.js').forEach(function (routePath) {
        require(path.resolve(routePath)).publish(app);
    });

    app.use(function (err, req, res, next) {
        // If the error object doesn't exists
        if (!err) return next();

        // Log it
        console.error(err.stack);

        // Error page
        res.status(500).json({
            error: err.stack
        });
    });

    return app;
};