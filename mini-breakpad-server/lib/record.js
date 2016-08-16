(function() {
  var Record, formidable, path, uuid;

  path = require('path');

  formidable = require('formidable');

  uuid = require('node-uuid');

  Record = (function() {
    Record.prototype.id = null;

    Record.prototype.time = null;

    Record.prototype.path = null;

    Record.prototype.product = null;

    Record.prototype.version = null;

    Record.prototype.fields = null;

    function Record(_arg) {
      this.id = _arg.id, this.time = _arg.time, this.path = _arg.path, this.sender = _arg.sender, this.product = _arg.product, this.version = _arg.version, this.fields = _arg.fields;
      if (this.id == null) {
        this.id = uuid.v4();
      }
      if (this.time == null) {
        this.time = new Date;
      }
    }

    Record.createFromRequest = function(req, callback) {
      var form;
      form = new formidable.IncomingForm();
      return form.parse(req, function(error, fields, files) {
        var record, _ref;
        if (((_ref = files.upload_file_minidump) != null ? _ref.name : void 0) == null) {
          return callback(new Error('Invalid breakpad upload'));
        }
        record = new Record({
          path: files.upload_file_minidump.path,
          sender: {
            ua: req.headers['user-agent'],
            ip: Record.getIpAddress(req)
          },
          product: fields.prod,
          version: fields.ver,
          fields: fields
        });
        return callback(null, record);
      });
    };

    Record.unserialize = function(id, representation) {
      return new Record({
        id: id,
        time: new Date(representation.time),
        path: representation.path,
        sender: representation.sender,
        product: representation.fields.prod,
        version: representation.fields.ver,
        fields: representation.fields
      });
    };

    Record.getIpAddress = function(req) {
      return req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    };

    Record.prototype.serialize = function() {
      return {
        time: this.time.getTime(),
        path: this.path,
        sender: this.sender,
        fields: this.fields
      };
    };

    return Record;

  })();

  module.exports = Record;

}).call(this);
