var http = require('q-io/http');

var personaAuth = {};

personaAuth.verify = function (assertion, audience) {
    var options = {
        url: 'https://verifier.login.persona.org/verify',
        method: 'POST',
        body: [
            JSON.stringify({
                assertion: assertion,
                audience: audience
            })
        ],
        headers: {
            'Content-Type': 'application/json'
        }
    };
    return http
        .request(options)
        .then(function (verificationResult) {
            return verificationResult.body.read();
        })
        .then(function (body) {
            return JSON.parse(body);
        });
};

module.exports = personaAuth;