describe('farm', function () {
  var sinonChai = require('./../fixtures/sinon.chai'),
      sinon,
      farm = require('../../lib/farm'),
      pubsub = require('../../lib/farm/client/pubsub'),
      reqrep = require('../../lib/farm/client/reqrep'),
      pushpull = require('../../lib/farm/client/pushpull');

  sinonChai(function (sandbox) { sinon = sandbox; });

  describe('init', function () {
    beforeEach(function () {
      sinon.stub(pubsub, 'init');
      sinon.stub(reqrep, 'init');
      sinon.stub(pushpull, 'init');
    });

    it('calls init on the pubsub module', function () {
      farm.init();
      pubsub.init.should.have.been.called;
    });

    it('calls init on the reqrep module', function () {
      farm.init();
      reqrep.init.should.have.been.called;
    });

    it('calls init on the pushpull module', function () {
      farm.init();
      pushpull.init.should.have.been.called;
    });
  });

  describe('join', function () {
    beforeEach(function () {
      sinon.stub(pubsub, 'join');
      sinon.stub(reqrep, 'join');
      sinon.stub(pushpull, 'join');
    });

    it('calls join on the pubsub module', function () {
      farm.join('Javert', true);
      pubsub.join.should.have.been.calledWith('Javert');
    });

    it('calls join on the reqrep module', function () {
      farm.join('Valjean', false);
      reqrep.join.should.have.been.calledWith('Valjean', false);
    });

    it('calls join on the pushpull module', function () {
      farm.join('Fantine', true);
      pushpull.join.should.have.been.calledWith('Fantine', true);
    });
  });

  describe('close', function () {
    beforeEach(function () {
      sinon.stub(pubsub, 'close');
      sinon.stub(reqrep, 'close');
      sinon.stub(pushpull, 'close');
    });

    it('calls close on the pubsub module', function () {
      farm.close();
      pubsub.close.should.have.been.calledWith();
    });

    it('calls close on the reqrep module', function () {
      farm.close();
      reqrep.close.should.have.been.calledWith();
    });

    it('calls close on the pushpull module', function () {
      farm.close();
      pushpull.close.should.have.been.calledWith();
    });
  });

  describe('events', function () {
    beforeEach(function () {
      sinon.stub(pubsub, 'publish');
      sinon.stub(pubsub, 'subscribe');
    });

    it('calls publish on pubsub module', function () {
      farm.events.publish('red', 'the blood of angry men');
      pubsub.publish.should.have.been.calledWith('red', 'the blood of angry men');
    });

    it('calls subscribe on pubsub module', function () {
      var theDarkOfAgesPast = sinon.stub();
      farm.events.subscribe('black', theDarkOfAgesPast);
      pubsub.subscribe.should.have.been.calledWith('black', theDarkOfAgesPast);
    });
  });

  describe('jobs', function () {
    beforeEach(function () {
      sinon.stub(reqrep, 'send');
      sinon.stub(pushpull, 'distribute');
    });

    it('calls send on reqrep module', function () {
      farm.jobs.send('god on high', 'bring him home');
      reqrep.send.should.have.been.calledWith('god on high', 'bring him home');
    });

    it('calls distribute on the pushpull module', function () {
      farm.jobs.distribute('sing', 'a song of angry men');
      pushpull.distribute.should.have.been.calledWith('sing', 'a song of angry men');
    });
  });

  describe('worker', function () {
    it('proxies the worker call to reqrep', function () {
      sinon.stub(reqrep, 'worker');
      var lookDown = sinon.stub();
      farm.worker(lookDown);
      reqrep.worker.should.have.been.calledWith(lookDown);
    });

    it('proxies the worker call to pushpull', function () {
      sinon.stub(pushpull, 'worker');
      var lookDown = sinon.stub();
      farm.worker(lookDown);
      pushpull.worker.should.have.been.calledWith(lookDown);
    });
  });
});
