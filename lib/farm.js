var pubsub = require('./client/pubsub'),
    reqrep = require('./client/reqrep'),
    initialized = false,
    pushpull = require('./client/pushpull');

module.exports = {
  init: function () {
    pubsub.init();
    reqrep.init();
    pushpull.init();
    return true;
  },
  join: function (ip, cfg) {
    cfg = cfg || {};
    initialized = initialized ? true : module.exports.init();
    module.exports.init();
    pubsub.join(ip, cfg);
    reqrep.join(ip, cfg);
    pushpull.join(ip, cfg);
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
