(function() {
  var cache;

  cache = {};

  module.exports = {
    get: function(id) {
      return cache[id];
    },
    set: function(id, data) {
      return cache[id] = data;
    },
    has: function(id) {
      return cache.hasOwnProperty(id);
    }
  };

}).call(this);
