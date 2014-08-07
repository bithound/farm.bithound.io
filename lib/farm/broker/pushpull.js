var zmq = require('zmq'),
    uuid = require('uuid'),
    async = require('async'),
    utils = require('../../utils'),
    tasks = {};

module.exports = {
  start: function () {
    var router = zmq.socket('router'),
        push = zmq.socket('push'),
        pull = zmq.socket('pull'),
        error = require('./../error');

    router.on('message', function () {
      //ZMQ adds two parts to the msg for routing over router / dealer sockets
      // first it the identity frame, then an empty frame, then the payload
      var payload = [].slice.call(arguments),
          identity = payload.shift(),
          empty = payload.shift();

      async.map(payload, function (task, cb) {
        var id = uuid.v1();
        tasks[id] = { task: task, cb: cb };
        push.send([id, task]);
      }, function (err, results) {
        //send the results as a multipart message
        // - err, r1, r2, ... rN
        router.send([identity, empty, utils.serialize(err)].concat(results.map(utils.serialize)));
      });
    });
    

    pull.on('message', function (id, err, result) {
      id = id.toString();
      var task = tasks[id];

      if (!task) { return; }

      err = utils.deserialize(err);

      if (err && task.retry !== 3) {
        task.retry = ++task.retry || 1;
        console.log('retry', task.retry, id);
        setTimeout(function () {
          push.send([id, task.task]);
        }, 100);
      }
      else {
        var cb = task.cb;
        delete tasks[id];
        return cb && cb(err, utils.deserialize(result));
      }
    });

    pull.on('error', error.handle);
    push.on('error', error.handle);
    router.on('error', error.handle);

    router.bindSync('tcp://*:5003');
    push.bindSync('tcp://*:5557');
    pull.bindSync('tcp://*:5558');

    return {
      stop: function () {
        router.close();
        push.close();
        pull.close();
      }
    };
  }
};

//assume the only message is to start ;)
process.on('message', module.exports.start);
