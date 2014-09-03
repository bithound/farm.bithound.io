describe('farm broker pushpull', function () {
  var sinonChai = require('../../../fixtures/sinon.chai'),
      pushpull = require('../../../../lib/broker/pushpull'),
      zmq = require('zmq'),
      sinon, sockets;

  sinonChai(function (sandbox) { sinon = sandbox; });

  beforeEach(function () {
    sockets = {
      router: {
        bindSync: sinon.stub(),
        on: sinon.stub(),
        close: sinon.stub(),
      },
      pull: {
        bindSync: sinon.stub(),
        on: sinon.stub(),
        close: sinon.stub(),
        send: sinon.stub()
      },
      push: {
        bindSync: sinon.stub(),
        on: sinon.stub(),
        close: sinon.stub(),
        send: sinon.stub()
      }
    };

    sinon.stub(zmq, 'socket')
      .withArgs('router').returns(sockets.router)
      .withArgs('pull').returns(sockets.pull)
      .withArgs('push').returns(sockets.push);
  });

  describe('starting', function () {
    it('creates router socket', function () {
      pushpull.start();
      zmq.socket.should.have.been.calledWith('router');
    });

    it('creates an pull socket', function () {
      pushpull.start();
      zmq.socket.should.have.been.calledWith('pull');
    });

    it('creates an push socket', function () {
      pushpull.start();
      zmq.socket.should.have.been.calledWith('push');
    });

    it('binds the router socket', function () {
      pushpull.start();
      sockets.router.bindSync.should.have.been.calledWith('tcp://*:5003');
    });

    it('binds the pull socket', function () {
      pushpull.start();
      sockets.pull.bindSync.should.have.been.calledWith('tcp://*:5558');
    });

    it('binds the push socket', function () {
      pushpull.start();
      sockets.push.bindSync.should.have.been.calledWith('tcp://*:5557');
    });

    it('registers for errors on the pull socket', function () {
      pushpull.start();
      sockets.pull.on.should.have.been.calledWith('error', sinon.match.func);
    });

    it('registers for errors on the push socket', function () {
      pushpull.start();
      sockets.push.on.should.have.been.calledWith('error', sinon.match.func);
    });

    it('registers for errors on the router socket', function () {
      pushpull.start();
      sockets.router.on.should.have.been.calledWith('error', sinon.match.func);
    });

    it('registers for messages on the pull socket', function () {
      pushpull.start();
      sockets.pull.on.should.have.been.calledWith('message', sinon.match.func);
    });

    it('doesn\'t register for messages on the push socket', function () {
      pushpull.start();
      sockets.push.on.should.not.have.been.calledWith('message', sinon.match.func);
    });

    it('registers for messages on the router socket', function () {
      pushpull.start();
      sockets.router.on.should.have.been.calledWith('message', sinon.match.func);
    });
  });
});
