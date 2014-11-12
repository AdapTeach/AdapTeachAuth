(function(){
  'use strict';

  /**
   * Module dependencies.
   */
  var express = require('express'),
    morgan = require('morgan'),
    bodyParser = require('body-parser'),
    compress = require('compression'),
    methodOverride = require('method-override'),
    config = require('./config'),
    path = require('path'),
    cors = require('cors');

  module.exports = function (db) {
    var app = express();

    config.getGlobbedFiles('./src/model/*.js').forEach(function (modelPath) {
      require(path.resolve(modelPath));
    });

    app.use(compress({
      filter: function (req, res) {
        return (/json/).test(res.getHeader('Content-Type'));
      },
      level: 9
    }));

    // Showing stack errors
    app.set('showStackError', true);

    // Environment dependent middleware
    if (process.env.NODE_ENV === 'development') {
      // Enable logger (morgan)
      app.use(morgan('dev'));

      // Disable views cache
    } else if (process.env.NODE_ENV === 'production') {
//		app.locals.cache = 'memory';
    }

    // Request body parsing middleware should be above methodOverride
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded());
    app.use(methodOverride());


    // Enable jsonp
    //app.enable('jsonp callback');


    //app.disable('x-powered-by');

    app.use(cors());

    app.use(function (req, res, next) {
      res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
      //res.header("Access-Control-Allow-Origin", "*");
      res.header('Access-Control-Allow-Credentials', true);
      //res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
      next();
    });

    config.getGlobbedFiles('./src/routes/*.js').forEach(function (routePath) {
      require(path.resolve(routePath))(app);
    });

    // Assume 'not found' in the error msgs is a 404. this is somewhat silly, but valid, you can do whatever you like, set properties, use instanceof etc.
    app.use(function (err, req, res, next) {
      if (!err) return next();

      console.error(err.stack);

      // Error page
//		res.status(500).render('500', {
//			error: err.stack
//		});
      res.json(500, {
        message: 'critical error'
      })
    });

    return app;
  };
})();