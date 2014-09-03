module.exports = {
  start: function () {
    var fork = require('child_process').fork,
        reqrep = fork(require.resolve('./broker/reqrep')),
        pubsub = fork(require.resolve('./broker/pubsub')),
        pushpull = fork(require.resolve('./broker/pushpull'));

    reqrep.send('start');
    pubsub.send('start');
    pushpull.send('start');

    return {
      stop: function () {
        reqrep.kill();
        pubsub.kill();
        pushpull.kill();
      }
    };
  }
};
