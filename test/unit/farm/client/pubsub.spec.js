describe('farm pubsub client', function () {
  var sinonChai = require('../../../fixtures/sinon.chai'),
      pubsub = require('../../../../lib/farm/client/pubsub'),
      events = require('events'),
      zmq = require('zmq'),
      emitter, sockets, sinon;

  sinonChai(function (sandbox) { sinon = sandbox; });

  beforeEach(function () {
    emitter = {
      emit: sinon.stub(),
      on: sinon.stub()
    };
    sockets = {
      sub: {
        connect: sinon.stub(),
        on: sinon.stub(),
        close: sinon.stub(),
        subscribe: sinon.stub()
      },
      pub: {
        connect: sinon.stub(),
        on: sinon.stub(),
        close: sinon.stub(),
        send: sinon.stub()
      }
    };

    sinon.stub(zmq, 'socket')
      .withArgs('sub').returns(sockets.sub)
      .withArgs('pub').returns(sockets.pub);

    sinon.stub(events, 'EventEmitter').returns(emitter);
  });

  describe('init', function () {
    it('creates a new emitter', function () {
      pubsub.init();
      events.EventEmitter.should.have.been.calledWith();
    });

    it('creates a pub socket', function () {
      pubsub.init();
      zmq.socket.should.have.been.calledWith('pub');
    });

    it('creates a sub socket', function () {
      pubsub.init();
      zmq.socket.should.have.been.calledWith('sub');
    });

    it('registers for messages on the sub socket', function () {
      pubsub.init();
      sockets.sub.on.should.have.been.calledWith('message', sinon.match.func);
    });

    describe('handling messages on the sub socket', function () {
      var utils = require('../../../../lib/utils'),
          buff = function (val) {
            return { toString: sinon.stub().returns(val) };
          },
          func;

      beforeEach(function () {
        sinon.stub(utils, 'deserialize').returns('I Dreamed a Dream');
        pubsub.init();
        func = sockets.sub.on.args[1][1];
      });

      it('calls toString on the buffer', function () {
        var msg = buff('Master of the house');
        func(msg);
        msg.toString.should.have.been.called;
      });

      it('splits the string by | and deserializes the second half', function () {
        func(buff('childhood |{his stride}'));
        utils.deserialize.should.have.been.calledWith('{his stride}');
      });

      it('emits the event', function () {
        func(buff('Fantine |{alone, unemployed and destitute}'));
        emitter.emit.should.have.been.calledWith('Fantine', 'I Dreamed a Dream');
      });
    });
  });

  describe('join', function () {
    beforeEach(pubsub.init);

    it('connects the sub socket', function () {
      pubsub.join('127.0.0.1');
      sockets.sub.connect.should.have.been.calledWith('tcp://127.0.0.1:5555');
    });

    it('connects the pub socket', function () {
      pubsub.join('localhost');
      sockets.pub.connect.should.have.been.calledWith('tcp://localhost:5556');
    });
  });

  describe('close', function () {
    beforeEach(pubsub.init);

    it('connects the sub socket', function () {
      pubsub.close();
      sockets.sub.close.should.have.been.calledWith();
    });

    it('connects the pub socket', function () {
      pubsub.close();
      sockets.pub.close.should.have.been.calledWith();
    });
  });

  it('publishes the event on the pub socket', function () {
    pubsub.init();
    pubsub.publish('I dreamed', 'that love would be forgiving');
    sockets.pub.send.should.have.been.calledWith('I dreamed |"that love would be forgiving"');
  });

  describe('subscribe', function () {
    beforeEach(pubsub.init);

    it('calls subscribe on the sub socket', function () {
      var thePeopleSing = sinon.stub();
      pubsub.subscribe('hear', thePeopleSing);
      sockets.sub.subscribe.should.have.been.calledWith('hear');
    });

    it('adds the handler to the emitter', function () {
      var aSongOfAngryMen = sinon.stub();
      pubsub.subscribe('singing', aSongOfAngryMen);
      emitter.on.should.have.been.calledWith('singing', aSongOfAngryMen);
    });
  });
});
