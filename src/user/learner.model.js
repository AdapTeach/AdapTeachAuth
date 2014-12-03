var mongoose = require('mongoose-q')(require('mongoose')),
    Schema = mongoose.Schema,
    config = require('../../config/config'),
    jwt = require('jwt-simple'),
    moment = require('moment');

var userSchema = new Schema({
    email: {
        type: String,
        required: 'you should provide an email',
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, "You should provide a valid email"],
        unique: true
    },
    firstname: {
        type: String
    },
    lastname: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

userSchema.methods.createJwtToken = function () {
    var payload = {
        user: this,
        iat: moment().valueOf(),
        exp: moment().add(7, 'days').valueOf()
    };
    return jwt.encode(payload, config.TOKEN_SECRET);
};

userSchema.methods.getAuthData = function () {
    return {
        user: this,
        token: this.createJwtToken()
    };
};

userSchema.statics.findOrCreate = function (email) {
    return User
        .findByEmail(email)
        .then(function createIfNotExists(user) {
            if (!user) { // no existing user, create a new one and return it
                return new User({email: email, studentEmail: email}).saveQ();
            } else {
                return user;
            }
        });
};

userSchema.statics.findByEmail = function (email) {
    return User.findOne({email: email}).execQ();
};

var User = mongoose.model('User', userSchema);

module.exports = User;
