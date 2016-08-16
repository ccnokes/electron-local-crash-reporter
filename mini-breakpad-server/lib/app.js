(function() {
  var Database, WebHook, app, db, express, path, reader, root, saver, webhook;

  path = require('path');

  express = require('express');

  reader = require('./reader');

  saver = require('./saver');

  Database = require('./database');

  WebHook = require('./webhook');

  app = express();

  webhook = new WebHook;

  db = new Database;

  db.on('load', function() {
    var port, _ref;
    port = (_ref = process.env.MINI_BREAKPAD_SERVER_PORT) != null ? _ref : 1127;
    app.listen(port);
    return console.log("Listening on port " + port);
  });

  app.set('views', path.resolve(__dirname, '..', 'views'));

  app.set('view engine', 'jade');

  app.use(express.json());

  app.use(express.urlencoded());

  app.use(express.methodOverride());

  app.use(app.router);

  app.use(function(err, req, res, next) {
    return res.send(500, "Bad things happened:<br/> " + err.message);
  });

  app.post('/webhook', function(req, res, next) {
    webhook.onRequest(req);
    console.log('webhook requested', req.body.repository.full_name);
    return res.end();
  });

  app.post('/post', function(req, res, next) {
    return saver.saveRequest(req, db, function(err, filename) {
      if (err != null) {
        return next(err);
      }
      console.log('saved', filename);
      res.send(path.basename(filename));
      return res.end();
    });
  });

  root = process.env.MINI_BREAKPAD_SERVER_ROOT != null ? "" + process.env.MINI_BREAKPAD_SERVER_ROOT + "/" : '';

  app.get("/" + root, function(req, res, next) {
    return res.render('index', {
      title: 'Crash Reports',
      records: db.getAllRecords()
    });
  });

  app.get("/" + root + "view/:id", function(req, res, next) {
    return db.restoreRecord(req.params.id, function(err, record) {
      if (err != null) {
        return next(err);
      }
      return reader.getStackTraceFromRecord(record, function(err, report) {
        var fields;
        if (err != null) {
          return next(err);
        }
        fields = record.fields;
        return res.render('view', {
          title: 'Crash Report',
          report: report,
          fields: fields
        });
      });
    });
  });

}).call(this);
