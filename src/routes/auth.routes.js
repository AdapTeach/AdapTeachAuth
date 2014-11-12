(function () {
  'use strict';

  var auth = require('../controllers/auth.ctrl.js'),
    mongoose = require('mongoose-q')(),
    User = mongoose.model('User');

  module.exports = function (app) {

    //app.post('/auth/signup',users.signup);
    app.post('/login', auth.login);

    app.get('/me', User.ensureAuthenticated, auth.me);
  };
})();