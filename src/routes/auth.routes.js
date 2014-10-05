'use strict';

var users = require('../controllers/auth.ctrl.js'),
    mongoose = require('mongoose-q')(),
    User = mongoose.model('User');

module.exports = function(app) {

    app.post('/auth/signup',users.signup);
    app.post('/auth/login',users.signin);
    app.post('/auth/github',users.githubAuth);
    app.post('/auth/personna',users.personnaAuth);

    app.get('/me',User.ensureAuthenticated,users.me);
};