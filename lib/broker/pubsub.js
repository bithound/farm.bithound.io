var zmq = require('zmq');
var conf = require('../conf');

module.exports = {
  start: function (cfg) {
    cfg = conf.broker(cfg);
    var xsub = zmq.socket('xsub'),
        xpub = zmq.socket('xpub'),
        error = require('./../error');

    xpub.bindSync('tcp://*:' + cfg.get('ports.subscribe'));
    xsub.bindSync('tcp://*:' + cfg.get('ports.publish'));
     
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
