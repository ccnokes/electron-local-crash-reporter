(function() {
  var DecompressZip, GitHub, WebHook, fs, glob, mkdirp, os, path, temp, wrench;

  fs = require('fs-plus');

  glob = require('glob');

  mkdirp = require('mkdirp');

  path = require('path');

  temp = require('temp');

  os = require('os');

  wrench = require('wrench');

  DecompressZip = require('decompress-zip');

  GitHub = require('github-releases');

  temp.track();

  WebHook = (function() {
    function WebHook() {}

    WebHook.prototype.onRequest = function(req) {
      var event, payload;
      event = req.headers['x-github-event'];
      payload = req.body;
      if (!(event === 'release' && payload.action === 'published')) {
        return;
      }
      return this.downloadAssets(payload);
    };

    WebHook.prototype.downloadAssets = function(payload) {
      var asset, github, _i, _len, _ref, _results,
        _this = this;
      github = new GitHub({
        repo: payload.repository.full_name,
        token: process.env.MINI_BREAKPAD_SERVER_TOKEN
      });
      _ref = payload.release.assets;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        asset = _ref[_i];
        if (/sym/.test(asset.name)) {
          _results.push((function(asset) {
            var dir, filename;
            dir = temp.mkdirSync();
            filename = path.join(dir, asset.name);
            return github.downloadAsset(asset, function(error, stream) {
              var file;
              if (error != null) {
                console.log('Failed to download', asset.name, error);
                _this.cleanup(dir);
                return;
              }
              file = fs.createWriteStream(filename);
              stream.on('end', _this.extractFile.bind(_this, dir, filename));
              return stream.pipe(file);
            });
          })(asset));
        }
      }
      return _results;
    };

    WebHook.prototype.extractFile = function(dir, filename) {
      var targetDirectory, unzipper,
        _this = this;
      targetDirectory = "" + filename + "-unzipped";
      unzipper = new DecompressZip(filename);
      unzipper.on('error', function(error) {
        console.log('Failed to decompress', filename, error);
        return _this.cleanup(dir);
      });
      unzipper.on('extract', function() {
        fs.closeSync(unzipper.fd);
        fs.unlinkSync(filename);
        return _this.copySymbolFiles(dir, targetDirectory);
      });
      return unzipper.extract({
        path: targetDirectory
      });
    };

    WebHook.prototype.copySymbolFiles = function(dir, targetDirectory) {
      var _this = this;
      return glob('*.breakpad.syms', {
        cwd: targetDirectory
      }, function(error, dirs) {
        var symbol, symbolsDirectory, _i, _len;
        if (error != null) {
          console.log('Failed to find breakpad symbols in', targetDirectory, error);
          _this.cleanup(dir);
          return;
        }
        symbolsDirectory = path.join('pool', 'symbols');
        for (_i = 0, _len = dirs.length; _i < _len; _i++) {
          symbol = dirs[_i];
          fs.copySync(path.join(targetDirectory, symbol), symbolsDirectory);
        }
        return _this.cleanup(dir);
      });
    };

    WebHook.prototype.cleanup = function(dir) {
      return wrench.rmdirSyncRecursive(dir, true);
    };

    return WebHook;

  })();

  module.exports = WebHook;

}).call(this);
