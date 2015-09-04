//This example shows that a worker can
//function without a callback function
//and jobs are requeued to other processes

var farm = require('../lib/farm'),
    async = require('async'),
    cluster = require('cluster');

// We are using cluster to keep this all in one file
if (cluster.isMaster) {
  var broker = require('../lib/broker').start();

  farm.join('localhost');

  //start a couple child processes
  cluster.fork();
  cluster.fork();

  async.parallel([
    async.apply(farm.jobs.distribute, ['hello','hello','hello']),
    async.apply(farm.jobs.distribute, ['hello','hello','hello'])
  ], function (err) {
    broker.stop();
    // Not expecting an error
    if (err) {
      console.log(err.stack);
      process.exit(1);
    }

    console.log("all good!");
    process.exit();
  });
}
else {
  // wait a little before we have a worker function
  setTimeout(function () {
    farm.worker(function (task, callback) {
      callback(null, 'world');
    });
  }, 1000);

  //connect to localhost and designate we are a worker
  farm.join('localhost', {worker: true});
}
