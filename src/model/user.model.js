'use strict';

var mongoose = require('mongoose-q')(),
    Schema = mongoose.Schema,
    bcrypt = require('bcryptjs'),
    Q = require('q'),
    config = require('../config/config'),
    jwt = require('jwt-simple'),
    moment = require('moment');

var UserSchema = new Schema({
    firstName: {
        type: String
    },
    lastName: {
        type: String
    },
    username: {
        type: String,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required : 'you should provide an email',
        match : [ /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, "You should provide a valid email" ],
        unique : true
    },
    emailValidated : {
        type : Boolean,
        default : false
    },
    password: {
        type: String,
        required : true
    },
    salt: {
        type: String
    },
    brief : {
        type : String
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    github: {
        type : String
    },
    twitter: {
        type : String
    }
});

UserSchema.pre('save', function(next) {
    var user = this;
    if (!user.isModified('password')) {
        return next();
    }
    bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(user.password, salt, function(err, hash) {
            user.password = hash;
            next();
        });
    });
});
UserSchema.methods.comparePassword = function(password) {
    var defered = Q.defer();
    bcrypt.compare(password, this.password, function(err, isMatch) {
        if(err){
            defered.reject(err);
        }else{
            defered.resolve(isMatch);
        }
    });
    return defered.promise;
};

//Static methods
UserSchema.statics.ensureAuthenticated = function(req, res, next) {
    if (!req.headers.authorization) {
        return res.status(401).end();
    }
    var token = req.headers.authorization.split(' ')[1];
    var payload = jwt.decode(token, config.TOKEN_SECRET);
    if (payload.exp <= Date.now()) {
        return res.status(401).send({ message: 'Token has expired' });
    }
    req.user = payload.user;
    next();
};


UserSchema.statics.createJwtToken = function(user) {
    var payload = {
        user: user,
        iat: moment().valueOf(),
        exp: moment().add(7, 'days').valueOf()
    };
    return jwt.encode(payload, config.TOKEN_SECRET);
};

module.exports = mongoose.model('User', UserSchema);