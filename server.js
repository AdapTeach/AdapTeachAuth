'use strict';
require('./config/init')();
var config = require('./config/config'),
    app = require('./config/express')(),
    mongoose = require('mongoose-q')();
mongoose.connect(config.db.address);
app.listen(config.port, config.address);
console.log('learner-profile api started on port ' + config.port);
