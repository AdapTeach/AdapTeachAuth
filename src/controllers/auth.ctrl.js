'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose-q')(),
    User = mongoose.model('User'),
    browseridVerify = require("browserid-verify"),
    _ = require('lodash'),
    request = require('request'),
    qs = require('querystring'),
    config = require('../config/config');


/**
 * Signup
 */
exports.signup = function(req, res) {
    var user = new User(req.body);
    // Then save the user
    user.saveQ().then(function(err) {
        res.json({
            message : 'Account created, you can now login'
        })
    }).fail(function(err){
        res.json(401, err);
    });
};


exports.signin = function(req, res) {
    User.findOneQ({ email: req.body.email }).then(function(user) {
        user.comparePassword(req.body.password).then(function() {
            user = user.toObject();
            delete user.password;
            var token = User.createJwtToken(user);
            res.json({ token: token });
        }).fail(function(err){
            res.json(401,{ message: 'Wrong password' });
        })
    }).fail(function(err){
        res.json(401,{ message: 'Wrong email' });
    });
};

exports.githubAuth = function(req, res) {

    var accessTokenUrl = 'https://github.com/login/oauth/access_token';
    var userApiUrl = 'https://api.github.com/user';
    var params = {
        client_id: req.body.clientId,
        redirect_uri: req.body.redirectUri,
        client_secret: config.GITHUB_SECRET,
        code: req.body.code
    };
// Step 1. Exchange authorization code for access token.
    request.get({ url: accessTokenUrl, qs: params }, function(error, response, accessToken) {
        accessToken = qs.parse(accessToken);
        var headers = { 'User-Agent': 'Satellizer' };
// Step 2. Retrieve information about the current user.
        request.get({ url: userApiUrl, qs: accessToken, headers: headers, json: true }, function(error, response, profile) {
            User.findOne({ github: profile.id }).execQ().then(function(user) {
                if (user) {
                    var token = User.createJwtToken(user);
                    return res.send({ token: token });
                }
                user = new User({
                    github: profile.id,
                    username: profile.name
                });
                user.saveQ().then(function() {
                    var token = User.createJwtToken(user);
                    res.json({ token: token });
                }).fail(function(err){
                    res.json(500,err);
                });
            }).fail(function(err){
                res.json(400,err);
            })
        });
    });
};


exports.personnaAuth = function(req,res){
    var verify = browseridVerify({
        url: config.personnaVerifUrl
    });
    if (!req.body) {
        res.json(400,{
            message : 'empty body'
        });
        return;
    }
    verify(req.body.assertion, "", function(err, email, response) {
        if (err) {
            res.json(401,err);
            return;
        }
        if (response && response.status !== "okay") {
            res.json(400,response.reason);
            return;
        }
        User.findOne({ email : email }).execQ().then(function(user){
           if(user){
               res.json(User.createJwtToken(user));
           }else{
               var myUser = new User({
                   email : email
               });
               myUser.saveQ().then(function(user){
                   res.json(User.createJwtToken(user));
               }).fail(function(err){
                  res.json(401,err);
               });
           }

        }).fail(function(err){
            res.json(400,{
                message : '500'
            })
        });
    });

};

exports.me = function(req, res) {
    res.json(req.user);
};
