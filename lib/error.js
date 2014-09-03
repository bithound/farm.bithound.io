var isc = new RegExp('interrupted system call', 'i');

module.exports = {
  handle: function (err) {
    if (err.toString().match(isc)) {
      console.log('non-fatal error:', err);
      return;
    }

    throw (err);
  }
};
