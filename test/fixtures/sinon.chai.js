var
  sinon = require('sinon'),
  chai = require('chai'),
  sinonChai = require('sinon-chai');

chai.use(sinonChai).use(chai.should).should();

global.expect = chai.expect;

function sandbox(callback) {
  var session;

  beforeEach(function () {
    session = sinon.sandbox.create();
    session.match = sinon.match;
    callback(session);
  });

  afterEach(function () {
    session.verifyAndRestore();
  });
}

module.exports = sandbox;
