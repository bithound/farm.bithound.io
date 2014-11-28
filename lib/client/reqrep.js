var zmq = require('zmq'),
    req, rep,
    utils = require('../utils'),
    error = require('../error'),
    requests = [],
    func;

module.exports = {
  init: function () {
    req = zmq.socket('req');
    rep = zmq.socket('rep');

    req.on('error', error.throw('req'));
    rep.on('error', error.throw('rep'));

    req.on('message', function (err, result) {
      err = utils.deserialize(err);
      result = utils.deserialize(result);

      if (result === 'hello!') { return; }



      var callback = requests.shift();
      return callback && callback(err, result);
    });

    rep.on('message', function (buff) {
      var task = utils.deserialize(buff);

      if (task === 'hello?') {
        return rep.send([null, '"hello!"']);
      }

      if (func) {
        func(task, function (err, result) {
          rep.send([
            utils.serialize(err),
            utils.serialize(result)
          ]);
        });
      }
      else {
        rep.send([utils.serialize(new Error('not_ready'))]);
      }
    });
  },
  join: function (ip, worker) {
    req.connect('tcp://' + ip + ':5000');
    if (worker) {
      rep.connect('tcp://' + ip + ':5001');
    }

    req.send('"hello?"');
  },
  close: function () {
    req.close();
    rep.close();
  },
  send: function (task, callback) {
    requests.push(callback);
    req.send(utils.serialize(task));
  },
  worker: function (handler) {
    func = handler;
  }
};
