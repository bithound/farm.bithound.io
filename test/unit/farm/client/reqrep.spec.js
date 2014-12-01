describe('farm reqrep client', function () {
  var sinonChai = require('../../../fixtures/sinon.chai'),
      reqrep = require('../../../../lib/client/reqrep'),
      utils = require('../../../../lib/utils'),
      zmq = require('zmq'),
      sockets, sinon;

  sinonChai(function (sandbox) { sinon = sandbox; });

  beforeEach(function () {
    sockets = {
      req: {
        connect: sinon.stub(),
        on: sinon.stub(),
        close: sinon.stub(),
        send: sinon.stub()
      },
      rep: {
        connect: sinon.stub(),
        on: sinon.stub(),
        close: sinon.stub(),
        send: sinon.stub()
      }
    };

    sinon.stub(zmq, 'socket')
      .withArgs('req').returns(sockets.req)
      .withArgs('rep').returns(sockets.rep);
  });

  describe('init', function () {
    it('creates a req socket', function () {
      reqrep.init();
      zmq.socket.should.have.been.calledWith('req');
    });

    it('creates a rep socket', function () {
      reqrep.init();
      zmq.socket.should.have.been.calledWith('rep');
    });

    it('registers for messages on the req socket', function () {
      reqrep.init();
      sockets.req.on.should.have.been.calledWith('message', sinon.match.func);
    });

    it('registers for messages on the rep socket', function () {
      reqrep.init();
      sockets.rep.on.should.have.been.calledWith('message', sinon.match.func);
    });

    describe('handing messages on the req socket', function () {
      var func;

      beforeEach(function () {
        reqrep.init();
        func = sockets.req.on.lastCall.args[1];
        sinon.stub(utils, 'deserialize').returns('Celestia');
      });

      it('deserializes the buffer', function () {
        func(null, 'Spike The Dragon');
        utils.deserialize.should.have.been.calledWith('Spike The Dragon');
      });

      it('calls the callback from send', function () {
        var cb = sinon.stub();
        reqrep.send('evt', cb);
        func(null, 'Luna');
        cb.should.have.been.calledWith('Celestia', 'Celestia');
      });
    });

    describe('handling messages on the rep socket', function () {
      var worker, func;

      beforeEach(function () {
        reqrep.init();
        sinon.stub(utils, 'deserialize').returns('Rarity');
        func = sockets.rep.on.lastCall.args[1];
        reqrep.worker(null);

        sinon.stub(process, 'nextTick', function (func) {
          func();
        });
      });

      //HACK: figure out how to test this again
      xit('sends worker is not ready when no worker', function () {
        func('Pinkie Pie');
        var err = utils.deserialize.lastCall;
        console.log(err);
        expect(utils.deserialize).to.have.been.calledWith([new Error('not_ready')]);
      });

      describe('after a worker is assigned', function () {
        beforeEach(function () {
          worker = sinon.stub();
          reqrep.worker(worker);
        });

        it('deserializes the buffer', function () {
          func('Fluttershy');
          utils.deserialize.should.have.been.calledWith('Fluttershy');
        });

        it('calls the worker function', function () {
          func('rainbow dash');
          worker.should.have.been.calledWith('Rarity', sinon.match.func);
        });

        it('sends the serialized err and result on the rep socket', function () {
          func('twilight sparkle');
          worker.lastCall.args[1]('error', 'result');
          sockets.rep.send.should.have.been.calledWith(['"error"', '"result"']);
        });
      });
    });
  });

  describe('join', function () {
    beforeEach(reqrep.init);

    it('calls connect on the req socket', function () {
      reqrep.join('10.10.1.1', {});
      sockets.req.connect.should.have.been.calledWith('tcp://10.10.1.1:5000');
    });

    it('doesn\'t connect to the rep socket', function () {
      reqrep.join('10.1.1.1', {});
      sockets.rep.connect.should.not.have.been.called;
    });

    it('connects to the rep socket if you pass in true for worker', function () {
      reqrep.join('10.1.1.1', {worker: true});
      sockets.rep.connect.should.have.been.calledWith('tcp://10.1.1.1:5001');
    });
  });

  describe('close', function () {
    beforeEach(reqrep.init);

    it('calls close on the req socket', function () {
      reqrep.close();
      sockets.req.close.should.have.been.called;
    });

    it('calls close on the rep socket', function () {
      reqrep.close();
      sockets.rep.close.should.have.been.called;
    });
  });

  it('sends the task on the req socket', function () {
    reqrep.init();
    reqrep.send('AppleJack', sinon.stub());
    sockets.req.send.should.have.been.calledWith('"AppleJack"');
  });
});
