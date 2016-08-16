(function() {
  var Record, fs, mkdirp, path;

  fs = require('fs-plus');

  path = require('path');

  mkdirp = require('mkdirp');

  Record = require('./record');

  exports.saveRequest = function(req, db, callback) {
    return Record.createFromRequest(req, function(err, record) {
      var dist;
      if (err != null) {
        return callback(new Error("Invalid breakpad request"));
      }
      dist = "pool/files/minidump";
      return mkdirp(dist, function(err) {
        var filename;
        if (err != null) {
          return callback(new Error("Cannot create directory: " + dist));
        }
        filename = path.join(dist, record.id);
        return fs.copy(record.path, filename, function(err) {
          if (err != null) {
            return callback(new Error("Cannot create file: " + filename));
          }
          record.path = filename;
          return db.saveRecord(record, function(err) {
            if (err != null) {
              return callback(new Error("Cannot save record to database"));
            }
            return callback(null, filename);
          });
        });
      });
    });
  };

}).call(this);
