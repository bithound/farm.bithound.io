var zmq = require('zmq');

module.exports = {
  start: function () {
    var xsub = zmq.socket('xsub'),
        xpub = zmq.socket('xpub'),
        error = require('./../error');

    xpub.bindSync('tcp://*:5555');
    xsub.bindSync('tcp://*:5556');
     
    xsub.on('message', function(data) { xpub.send(data); });
    xpub.on('message', function(data) { xsub.send(data); });

    xsub.on('error', error.log('xsub'));
    xpub.on('error', error.log('xpub'));

    return {
      stop: function () {
        xsub.close();
        xpub.close();
      }
    };
  }
};

//assume the only message is to start ;)
process.on('message', module.exports.start);
