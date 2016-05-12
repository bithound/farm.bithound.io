var conf = require('./conf');
module.exports = {
  start: function (cfg) {
    cfg = cfg || {};
    var fork = require('child_process').fork,
        reqrep = fork(require.resolve('./broker/reqrep')),
        pubsub = fork(require.resolve('./broker/pubsub')),
        pushpull = fork(require.resolve('./broker/pushpull'));

    reqrep.send(cfg);
    pubsub.send(cfg);
    pushpull.send(cfg);

    return {
      stop: function () {
        reqrep.kill();
        pubsub.kill();
        pushpull.kill();
      }
    };
  }
};
