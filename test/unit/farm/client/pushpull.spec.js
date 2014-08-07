describe('farm pushpull client', function () {
  var sinonChai = require('../../../fixtures/sinon.chai'),
      pushpull = require('../../../../lib/farm/client/pushpull'),
      zmq = require('zmq'),
      sockets,
      sinon;
      
  sinonChai(function (sandbox) { sinon = sandbox; });

  beforeEach(function () {
    sockets = {
      push: {
        connect: sinon.stub(),
        on: sinon.stub(),
        close: sinon.stub(),
        send: sinon.stub()
      },
      pull: {
        connect: sinon.stub(),
        on: sinon.stub(),
        close: sinon.stub(),
        send: sinon.stub()
      },
      req: {
        connect: sinon.stub(),
        on: sinon.stub(),
        close: sinon.stub(),
        send: sinon.stub()
      }
    };

    sinon.stub(zmq, 'socket')
      .withArgs('req').returns(sockets.req)
      .withArgs('push').returns(sockets.push)
      .withArgs('pull').returns(sockets.pull);
  });

  describe('init', function () {
    it('creates a req socket', function () {
      pushpull.init();
      zmq.socket.should.have.been.calledWith('req');
    });

    it('creates a pull socket', function () {
      pushpull.init();
      zmq.socket.should.have.been.calledWith('pull');
    });

    it('creates a push socket', function () {
      pushpull.init();
      zmq.socket.should.have.been.calledWith('push');
    });

    it('registers for messages on the pull socket', function () {
      pushpull.init();
      sockets.pull.on.should.have.been.calledWith('message', sinon.match.func);
    });

    it('registers for messages on the req socket', function () {
      pushpull.init();
      sockets.req.on.should.have.been.calledWith('message', sinon.match.func);
    });

    describe('handing messages on the req socket', function () {
      var func;

      beforeEach(function () {
        pushpull.init();
        func = sockets.req.on.lastCall.args[1];

        sinon.stub(process, 'nextTick', function (func) {
          func();
        });
      });


      it('can be called without a callback', function () {
        expect(function () {
          func('"null"');
        }).should.not.Throw;
      });

      it('calls the callback from send', function () {
        var cb = sinon.stub();
        pushpull.distribute([1,2,3,4,5], cb);
        func('"error"', '"one"', '"two"', '"three"', '4');
        cb.should.have.been.calledWith('error', ['one', 'two', 'three', 4]);
      });
    });

    describe('handling messages on the pull socket', function () {
      var worker, func;

      beforeEach(function () {
        pushpull.init();
        func = sockets.pull.on.lastCall.args[1];
        pushpull.worker(null);

        sinon.stub(process, 'nextTick', function (func) {
          func();
        });
      });

      it('sends worker is not ready when no worker', function () {
        func('12', '"Pinkie Pie"');
        sockets.push.send.should.have.been.calledWith(['12', 'worker not ready']);
      });

      describe('after a worker is assigned', function () {
        beforeEach(function () {
          worker = sinon.stub();
          pushpull.worker(worker);
        });

        it('calls the worker function', function () {
          func(12, '"rainbow dash"');
          worker.should.have.been.calledWith('rainbow dash', sinon.match.func);
        });

        it('sends the serialized err and result on the push socket', function () {
          func(42, '"twilight sparkle"');
          worker.lastCall.args[1]('error', 'result');
          sockets.push.send.should.have.been.calledWith([42, '"error"', '"result"']);
        });
      });
    });
  });

  describe('join', function () {
    beforeEach(pushpull.init);

    it('calls connect on the req socket', function () {
      pushpull.join('10.10.1.1');
      sockets.req.connect.should.have.been.calledWith('tcp://10.10.1.1:5003');
    });

    it('doesn\'t connect to the push socket', function () {
      pushpull.join('10.1.1.1');
      sockets.push.connect.should.not.have.been.called;
    });

    it('doesn\'t connect to the pull socket', function () {
      pushpull.join('10.1.1.1');
      sockets.pull.connect.should.not.have.been.called;
    });

    it('connects to the pull socket if you pass in true for worker', function () {
      pushpull.join('10.1.1.1', true);
      sockets.pull.connect.should.have.been.calledWith('tcp://10.1.1.1:5557');
    });

    it('connects to the push socket if you pass in true for worker', function () {
      pushpull.join('10.1.1.1', true);
      sockets.push.connect.should.have.been.calledWith('tcp://10.1.1.1:5558');
    });
  });

  describe('close', function () {
    beforeEach(pushpull.init);

    it('calls close on the req socket', function () {
      pushpull.close();
      sockets.req.close.should.have.been.called;
    });

    it('calls close on the push socket', function () {
      pushpull.close();
      sockets.push.close.should.have.been.called;
    });

    it('calls close on the pull socket', function () {
      pushpull.close();
      sockets.pull.close.should.have.been.called;
    });
  });

  it('sends the task on the req socket', function () {
    pushpull.init();
    pushpull.distribute([
      'Twilight Sparkle',
      'Rainbow Dash',
      'Fluttershy',
      'Pinkie Pie',
      'Applejack',
      'Rarity'
    ], sinon.stub());
    sockets.req.send.should.have.been.calledWith([
      '"Twilight Sparkle"',
      '"Rainbow Dash"',
      '"Fluttershy"',
      '"Pinkie Pie"',
      '"Applejack"',
      '"Rarity"'
    ]);
  });
});
