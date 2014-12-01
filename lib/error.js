module.exports = {
  log: function (type) {
    return function (err) {
      console.log(type, 'error :', err);
    };
  },
  throw: function (type) {
    return function (err) {
      console.log(type, 'error :', err);

      if (err.message === 'Interrupted system call') {
        //HACK: if this is teh pull socket, error out. otherwise ignore
        if (type === 'pull') { throw (err); }
        return;
      }
    };
  }
};
