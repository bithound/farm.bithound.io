var isc = new RegExp('interrupted system call', 'i');

module.exports = {
  handle: function (err) {
    if (err.toString().match(isc)) {
      console.log(this);
      console.log(arguments);
      console.log('non-fatal error:', err);
    }

    throw (err);
  }
};
