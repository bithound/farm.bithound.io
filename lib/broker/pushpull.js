var zmq = require('zmq'),
    uuid = require('uuid'),
    async = require('async'),
    utils = require('../utils'),
    conf = require('../conf'),
    tasks = {};

module.exports = {
  start: function (cfg) {
    cfg = conf.broker(cfg);
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

      async.map(payload, function (task, callback) {
        var id = uuid.v1();
        tasks[id] = { task: task, callback: callback };
        push.send([id, task]);
      }, function (err, results) {
        //send the results as a multipart message
        // - err, r1, r2, ... rN
        router.send([identity, empty, utils.serialize(err)].concat(results));
      });
    });

    //Don't fear the reaper
    if (cfg.get('reaper.interval')) {
      setInterval(function () {
        var keys = Object.keys(tasks);
        if (cfg.get('reaper.log') && keys.length) {
          console.log(keys.length);
        }
        keys.forEach(function (key) {
          var task = tasks[key];
          task.ping = task.ping || Date.now();
          if ((Date.now() - task.ping) > cfg.get('reaper.limit')) {
            task.ping = Date.now();
            console.log('reaping', key, 'at', task.ping);
            push.send([key, task.task]);
          }
        });
      }, cfg.get('reaper.interval'));
    }
    
    pull.on('message', function (id, err, result) {
      id = id.toString();
      var task = tasks[id];

      if (!task) { return; }

      err = utils.deserialize(err);

      switch ((err || {}).message) {
        case 'ping':
          task.ping = Date.now();
          return;
        case 'not_ready':
        case 'busy':
        case 'exiting':
          //handle "good" retryable (sp?) errors
          task.ping = Date.now();
          setTimeout(function () {
            push.send([id, task.task]);
          }, cfg.get('retryTimeout'));
          return;
        default:
          delete tasks[id];
          var callback = task.callback;
          return callback && callback(err, result);
      }
    });

    pull.on('error', error.log('pull'));
    push.on('error', error.log('push'));
    router.on('error', error.log('router'));

    router.bindSync('tcp://*:' + cfg.get('ports.distribute'));
    push.bindSync('tcp://*:' + cfg.get('ports.task'));
    pull.bindSync('tcp://*:' + cfg.get('ports.result')) ;

    setInterval(function () {
      //HACK: THIS IS WRONG
      //      but seems to get things working
      pull.resume();
      push.resume();
      router.resume();
    }, 1000);

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
