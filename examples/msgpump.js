var farm = require('../lib/farm'),
    async = require('async'),
    cluster = require('cluster');

// We are using cluster to keep this all in one file
if (cluster.isMaster) {
  //We always need a broker running (on localhost)
  var broker = require('../lib/broker').start();

  //join the farm (started via the broker)
  farm.join('localhost');

  //start a couple child processes (which will be our workers)
  async.times(20, cluster.fork);

  async.forever(function (callback) {
    farm.jobs.distribute(['ping', 'ping', 'ping', 'ping'], function (err, result) {
      console.log(Date.now(), result);
      callback(err);
    });
  }, function (err) {
    console.log(err);
    broker.stop();
    process.exit();
  });
}
else {
  // setup a worker callback function
  farm.worker(function (task, callback) {
    switch (task) {
      case 'ping':
        setTimeout(async.apply(callback, null, process.pid + ':pong'), 1000);
        break;
      default: return callback(new Error('huh?'));
    }
  });

  //connect to localhost and designate we are a worker
  farm.join('localhost', {worker: true});
}
