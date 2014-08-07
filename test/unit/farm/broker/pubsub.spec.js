describe('farm broker pubsub', function () {
  var sinonChai = require('../../../fixtures/sinon.chai'),
      pubsub = require('../../../../lib/farm/broker/pubsub'),
      zmq = require('zmq'), sockets,
      sinon;

  sinonChai(function (sandbox) { sinon = sandbox; });

  beforeEach(function () {
    sockets = {
      xsub: {
        bindSync: sinon.stub(),
        on: sinon.stub(),
        close: sinon.stub(),
      },
      xpub: {
        bindSync: sinon.stub(),
        on: sinon.stub(),
        close: sinon.stub(),
        send: sinon.stub()
      }
    };
    sinon.stub(zmq, 'socket')
      .withArgs('xsub').returns(sockets.xsub)
      .withArgs('xpub').returns(sockets.xpub);
  });

  describe('starting', function () {
    it('creates an xsub socket', function () {
      pubsub.start();
      zmq.socket.should.have.been.calledWith('xsub');
    });

    it('creates an xpub socket', function () {
      pubsub.start();
      zmq.socket.should.have.been.calledWith('xpub');
    });

    it('binds the xpub socket', function () {
      pubsub.start();
      sockets.xpub.bindSync.should.have.been.calledWith('tcp://*:5555');
    });

    it('binds the xsub socket', function () {
      pubsub.start();
      sockets.xsub.bindSync.should.have.been.calledWith('tcp://*:5556');
    });

    it('registers for errors on the xpub socket', function () {
      pubsub.start();
      sockets.xpub.on.should.have.been.calledWith('error');
    });

    it('registers for errors on the xsub socket', function () {
      pubsub.start();
      sockets.xsub.on.should.have.been.calledWith('error');
    });

    it('registers for messages on the xpub socket', function () {
      pubsub.start();
      sockets.xpub.on.should.have.been.calledWith('message');
    });

    it('registers for messages on the xsub socket', function () {
      pubsub.start();
      sockets.xsub.on.should.have.been.calledWith('message');
    });
  });
});
