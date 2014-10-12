module.exports = {
  serialize: function (obj) {
    if (obj instanceof Error) {
      //Errors don't stringify, lets use a hammer!
      obj = Object.getOwnPropertyNames(obj).reduce(function (err, key) {
        return err[key] = obj[key], err;
      }, {});
    }
    return JSON.stringify(obj);
  },
  deserialize: function (str) {
    //NOTE: call toString just in case this is a buffer
    str = str.toString();
    if (str === 'undefined') { return undefined; }
    var obj = JSON.parse(str);

    if (obj && obj.message && obj.stack) {
      var e = new Error(obj.message);
      e.stack = obj.stack;
      return e;
    }

    return obj;
  }
};
