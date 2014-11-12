(function () {
  'use strict';

  /**
   * Module dependencies.
   */
  var mongoose = require('mongoose-q')(),
    User = mongoose.model('User'),
    _ = require('lodash'),
    config = require('../config/config'),
    q = require('q'),
    http = require('request-promise');


  function persona(assertion) {
    var deferred = q.defer(),
      option = {
        uri: 'https://verifier.login.persona.org/verify',
        method: 'POST',
        form: {
          assertion: assertion,
          audience: 'http://localhost:5000'
        }
      };
    http(option).then(function (data) {
      deferred.resolve(data);
    }).catch(function (err) {
      deferred.reject(err)
    });
    return deferred.promise;
  }

  function existUser(data) {
    var deferred = q.defer();
    var personaData = JSON.parse(data);
    User.findOne({email: personaData.email}).execQ().then(function (user) {
      if (user) {
        deferred.resolve(user);
      } else {
        deferred.reject(personaData.email);
      }
    }).fail(function (err) {
      //todo gerer l'erreur
    });
    return deferred.promise;
  }

  function createUser(email) {
    var user = new User({
      email: email
    });
    return user.saveQ();
  }

  exports.login = function (req, res) {
    persona(req.body.assertion)
      .then(existUser)
      .then(function(user){
        res.json(user)
      })
      .catch(createUser)
      .then(function(createdUser){
        res.json(createdUser);
      }).fail(function(err){
        console.log(err)
      })
  };

  exports.me = function (req, res) {
    res.json(req.user);
  };

})();