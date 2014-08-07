var pubsub = require('./farm/client/pubsub'),
    reqrep = require('./farm/client/reqrep'),
    initialized = false,
    pushpull = require('./farm/client/pushpull');

module.exports = {
  init: function () {
    pubsub.init();
    reqrep.init();
    pushpull.init();
    return true;
  },
  join: function (ip, worker) {
    initialized = initialized ? true : module.exports.init();
    module.exports.init();
    pubsub.join(ip);
    reqrep.join(ip, worker);
    pushpull.join(ip, worker);
  },
  close: function () {
    initialized = initialized ? true : module.exports.init();
    pubsub.close();
    reqrep.close();
    pushpull.close();
  },
  events: {
    publish: function (evt, data) {
      initialized = initialized ? true : module.exports.init();
      pubsub.publish(evt, data);
    },
    subscribe: function (evt, handler) {
      initialized = initialized ? true : module.exports.init();
      pubsub.subscribe(evt, handler);
    },
    unsubscribe: function (evt) {
      initialized = initialized ? true : module.exports.init();
      pubsub.unsubscribe(evt);
    }
  },
  jobs: {
    send: function (task, callback) {
      initialized = initialized ? true : module.exports.init();
      reqrep.send(task, callback);
    },
    distribute: function (tasks, callback) {
      initialized = initialized ? true : module.exports.init();
      pushpull.distribute(tasks, callback);
    }
  },
  worker: function (handler) {
    reqrep.worker(handler);
    pushpull.worker(handler);
  }
};
