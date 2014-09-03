var zmq = require('zmq'),
    distributer, pull, push,
    utils = require('../utils'),
    error = require('./../error'),
    fanouts = [],
    func;

module.exports = {
  init: function () {
    distributer = zmq.socket('req');
    pull = zmq.socket('pull');
    push = zmq.socket('push');
    fanouts = [];

    distributer.on('error', error.handle);
    pull.on('error', error.handle);
    push.on('error', error.handle);

    distributer.on('message', function () {
      //Multipart message
      var args = [].slice.call(arguments),
          err = utils.deserialize(args.shift()),
          results = args.map(utils.deserialize);

      var callback = fanouts.shift();
      return callback && callback(err, results);
    });

    pull.on('message', function (id, task) {
      if (func) {
        process.nextTick(function () {
          task = utils.deserialize(task);
          func(task, function (err, result) {
            push.send([
              id,
              utils.serialize(err),
              utils.serialize(result)
            ]);
          });
        });
      }
      else {
        push.send([id, 'worker not ready']);
      }
    });
  },
  join: function (ip, worker) {
    distributer.connect('tcp://' + ip + ':5003');

    //TODO: we really should do this better ;)
    if (worker) {
      pull.connect('tcp://' + ip + ':5557');
      push.connect('tcp://' + ip + ':5558');
    }
  },
  close: function () {
    distributer.close();
    pull.close();
    push.close();
  },
  distribute: function (tasks, callback) {
    //TODO: Check tasks is array
    fanouts.push(callback);
    //send as a multipart message
    //  t1, t2 ... tN
    distributer.send(tasks.map(utils.serialize));
  },
  worker: function (handler) {
    func = handler;
  }
};
