describe('farm broker', function () {
  var sinonChai = require('../../fixtures/sinon.chai'),
      broker = require('../../../lib/farm/broker'),
      cp = require('child_process'),
      fork, sinon;

  sinonChai(function (sandbox) { sinon = sandbox; });

  beforeEach(function () {
    fork = {
      send: sinon.stub(),
      kill: sinon.stub()
    };
    sinon.stub(cp, 'fork').returns(fork);
  });

  describe('when starting', function () {
    it('forks the reqrep module', function () {
      broker.start();
      expect(!!cp.fork.args[0][0].match(/reqrep.js$/)).to.equal(true);
    });

    it('forks the pubsub module', function () {
      broker.start();
      expect(!!cp.fork.args[1][0].match(/pubsub.js$/)).to.equal(true);
    });

    it('forks the pushpull module', function () {
      broker.start();
      expect(!!cp.fork.args[2][0].match(/pushpull.js$/)).to.equal(true);
    });

    it('calls send on the forked processes', function () {
      broker.start();
      expect(fork.send).to.have.been.calledWith('start');
      expect(fork.send.callCount).to.equal(3);
    });
  });

  describe('when stopping', function () {
    it('kills the 3 forked modules', function () {
      broker.start().stop();
      expect(fork.kill).to.have.been.calledWith();
      expect(fork.kill.callCount).to.equal(3);
    });
  });
});
