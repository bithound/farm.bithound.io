describe('farm reqrep broker', function () {
  var sinonChai = require('../../../fixtures/sinon.chai'),
      reqrep = require('../../../../lib/broker/reqrep'),
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
      dealer: {
        bindSync: sinon.stub(),
        on: sinon.stub(),
        close: sinon.stub(),
        send: sinon.stub()
      }
    };

    sinon.stub(zmq, 'socket')
      .withArgs('router').returns(sockets.router)
      .withArgs('dealer').returns(sockets.dealer);
  });

  describe('starting', function () {
    it('creates router socket', function () {
      reqrep.start();
      zmq.socket.should.have.been.calledWith('router');
    });

    it('creates an dealer socket', function () {
      reqrep.start();
      zmq.socket.should.have.been.calledWith('dealer');
    });

    it('binds the router socket', function () {
      reqrep.start();
      sockets.router.bindSync.should.have.been.calledWith('tcp://*:5000');
    });

    it('binds the dealer socket', function () {
      reqrep.start();
      sockets.dealer.bindSync.should.have.been.calledWith('tcp://*:5001');
    });

    it('registers for errors on the dealer socket', function () {
      reqrep.start();
      sockets.dealer.on.should.have.been.calledWith('error', sinon.match.func);
    });

    it('registers for errors on the router socket', function () {
      reqrep.start();
      sockets.router.on.should.have.been.calledWith('error', sinon.match.func);
    });

    it('registers for messages on the dealer socket', function () {
      reqrep.start();
      sockets.dealer.on.should.have.been.calledWith('message', sinon.match.func);
    });

    it('registers for messages on the router socket', function () {
      reqrep.start();
      sockets.router.on.should.have.been.calledWith('message', sinon.match.func);
    });
  });
});
