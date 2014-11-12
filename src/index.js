(function () {
  'use strict';

  require('./config/init')();

  var config = require('./config/config'),
    mongoose = require('mongoose-q')(),
    db = mongoose.connect(config.db),
    app = require('./config/express')(db),
    server = require('http').Server(app);

  server.listen(config.port);

  console.log(config.app.title+' is running on port ' + config.port);
})();