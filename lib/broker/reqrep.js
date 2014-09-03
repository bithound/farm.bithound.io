var zmq = require('zmq');

module.exports = {
  start: function () {
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

    frontend.on('error', error.handle);
    backend.on('error', error.handle);

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
