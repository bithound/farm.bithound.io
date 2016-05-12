var convict = require('convict');

var ports = {
  subscribe: {
    doc: 'Port for handling subscribed events',
    default: 5556
  },
  publish: {
    doc: 'Port for publishing events',
    default: 5555
  },
  distribute: {
    doc: 'Port for distribution of tasks',
    default: 5003
  },
  task: {
    doc: 'Port for receiving distributed tasks',
    default: 5557
  },
  result: {
    doc: 'Port for sending the result of a distributed task',
    default: 5558
  },
  send: {
    doc: 'Port for sending a task to be worked on',
    default: 5000
  },
  worker: {
    doc: 'Port for receiving tasks to work on',
    default: 5001
  }
};

module.exports = {
  client: function (cfg) {
    var conf = convict({
      worker: {
        doc: "will this client also be a worker process?",
        default: false
      },
      ports: ports
    });
    conf.load(cfg || {});
    return conf;
  },
  broker: function (cfg) {
    var conf = convict({
      reaper: {
        log: {
          doc: "enable detailed logging for reaper",
          default: false
        },
        limit: {
          doc: "number of milliseconds to wait before reaping a task",
          default: 1000
        },
        interval: {
          doc: "the interval to run the reaper process, 0 is dasabled",
          default: 0
        }
      },
      ports: ports,
      retryTimeout: {
        doc: "the time to wait before retrying a msg",
        default: 100
      }
    });
    conf.load(cfg || {});
    return conf;
  }
};
