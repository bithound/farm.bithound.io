var farm = require('../lib/farm'),
    cluster = require('cluster');

// We are using cluster to keep this all in one file
if (cluster.isMaster) {
  //We always need a broker running (on localhost)
  var broker = require('../lib/broker').start();

  //join the farm (started via the broker)
  farm.join('localhost');

  //start a couple child processes (which will be our workers)
  cluster.fork();
  cluster.fork();
  cluster.fork();

  setTimeout(function () {
    farm.jobs.send('hello', function (err, world) {
      farm.jobs.distribute(['?', '?', '?'], function (err, excited) {
        console.log('hello', world, excited.join(''));
        broker.stop();
        process.exit();
      });
    });
  }, 500);
}
else {
  // setup a worker callback function
  farm.worker(function (task, callback) {
    switch (task) {
      case 'hello': return callback(null, 'world');
      case '?': return callback(null, '!');
      default: return callback(new Error('huh?'));
    }
  });

  //connect to localhost and designate we are a worker
  farm.join('localhost', {worker: true});
}
