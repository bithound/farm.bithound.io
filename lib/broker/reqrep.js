var zmq = require('zmq');
var conf = require('../conf');

module.exports = {
  start: function (cfg) {
    cfg = conf.broker(cfg);
    var frontend = zmq.socket('router'),
        backend = zmq.socket('dealer'),
        error = require('./../error');

    frontend.bindSync('tcp://*:5000');
    backend.bindSync('tcp://*:5001');

    frontend.on('message', function () {
      backend.send(Array.apply(null, arguments));
    });

    backend.on('message', function() {
      frontend.send(Array.apply(null, arguments));
    });

    frontend.on('error', error.log('fe'));
    backend.on('error', error.log('be'));

    return {
      stop: function () {
        frontend.close();
        backend.close();
      }
    };
  }
};

//assume the only message is to start ;)
process.on('message', module.exports.start);
