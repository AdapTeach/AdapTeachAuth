var personaAuth = require('./auth.persona'),
    User = require('../user/learner.model.js'),
    ensureAuthenticated = require('../auth/auth.middleware').ensureAuthenticated,
    httpError = require('../error/error.http');

var routes = {};

routes.publish = function (router) {

    router.post('/login', function (request, response) {
        personaAuth
            .verify(request.body.assertion, request.body.audience)
            .then(function checkStatus(verificationResult) {
                if (verificationResult.status !== 'okay') {
                    httpError.throw(401, verificationResult.status);
                }
                return verificationResult.email;
            })
            .then(function getUser(email) {
                return User.findOrCreate(email);
            })
            .then(function sendResponse(user) {
                response.json(user.getAuthData());
            })
            .catch(httpError.handle(response));
    });

    router.get('/me', ensureAuthenticated, function (request, response) {
        User.findByIdQ(request.user._id)
            .then(function returnEmail(user) {
                response.json(user);
            })
            .catch(httpError.handle(response));
    });

};

module.exports = routes;