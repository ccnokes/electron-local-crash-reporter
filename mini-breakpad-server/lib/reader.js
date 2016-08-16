(function() {
  var cache, minidump, path;

  path = require('path');

  minidump = require('minidump');

  cache = require('./cache');

  module.exports.getStackTraceFromRecord = function(record, callback) {
    var symbolPaths;
    if (cache.has(record.id)) {
      return callback(null, cache.get(record.id));
    }
    symbolPaths = [path.join('pool', 'symbols')];

    return minidump.walkStack(record.path, symbolPaths, function(err, report) {
      if (err == null) {
        cache.set(record.id, report);
      }
      return callback(err, report);
    });
  };

}).call(this);
