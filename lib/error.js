module.exports = {
  log: function (type) {
    return function (err) {
      console.log(type, 'error :', err);
    };
  },
  throw: function (type) {
    return function (err) {
      console.log(type, 'error :', err);
      throw (err);
    };
  }
};
