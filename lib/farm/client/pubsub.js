var zmq = require('zmq'),
    pub, sub,
    emitter,
    events = require('events'),
    utils = require('../../utils'),
    error = require('./../error');

module.exports = {
  init: function () {
    emitter = new events.EventEmitter();
    pub = zmq.socket('pub');
    sub = zmq.socket('sub');

    pub.on('error', error.handle);
    sub.on('error', error.handle);

    sub.on('message', function (buff) {
      var msg = buff.toString(),
          evt = msg.split(' |')[0],
          data = utils.deserialize(msg.slice(evt.length+2));

      emitter.emit(evt, data);
    });
  },
  join: function (ip) {
    sub.connect('tcp://' + ip + ':' + 5555);
    pub.connect('tcp://' + ip + ':' + 5556);
  },
  close: function () {
    sub.close();
    pub.close();
  },
  publish: function (evt, data) {
    pub.send(evt + ' |' + utils.serialize(data));
  },
  subscribe: function (evt, handler) {
    sub.subscribe(evt);
    emitter.on(evt, handler);
  },
  unsubscribe: function (evt) {
    sub.unsubscribe(evt);
  }
};
