var convict = require('convict');

module.exports = {
  client: function (cfg) {
    var conf = convict({
      worker: {
        doc: "will this client also be a worker process?",
        default: false
      }
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
      retryTimeout: {
        doc: "the time to wait before retrying a msg",
        default: 100
      }
    });
    conf.load(cfg || {});
    return conf;
  }
};
