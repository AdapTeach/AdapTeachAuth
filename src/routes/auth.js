'use strict';

var users = require('../controllers/auth.ctrl.js');

module.exports = function(app) {

    app.post('/auth/signup',users.signup);
    app.route('/auth/login').post(users.signin);
    app.post('/auth/github',users.githubAuth);
    app.post('/auth/personna',users.personnaAuth)

};