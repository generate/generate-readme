'use strict';

require('mocha');
var fs = require('fs');
var path = require('path');
var assert = require('assert');
var generate = require('generate');
var npm = require('npm-install-global');
var gm = require('global-modules');
var del = require('delete');
var pkg = require('./package');
var generator = require('./');
var app;

var actual = path.resolve.bind(path, __dirname, 'actual');

function hasValue(str, val) {
  return str.indexOf(val) !== -1;
}

function hasValues(str, arr) {
  arr = Array.isArray(arr) ? arr : [arr];
  var len = arr.length;
  var idx = -1;
  while (++idx < len) {
    if (!hasValue(str, arr[idx])) {
      return false;
    }
  }
  return true;
}

function exists(name, fn, cb) {
  if (arguments.length === 2) {
    cb = fn;
    fn = function() {
      return true;
    };
  }
  return function(err) {
    if (err) return cb(err);
    var filepath = actual(name);
    fs.stat(filepath, function(err, stat) {
      if (err) return cb(err);
      assert(stat);
      assert(fn(fs.readFileSync(filepath, 'utf8')));
      del(actual(), cb);
    });
  };
}

function symlink(dir, cb) {
  var src = path.resolve(dir);
  var name = path.basename(src);
  var dest = path.resolve(gm, name);
  fs.stat(dest, function(err, stat) {
    if (err) {
      fs.symlink(src, dest, cb);
    } else {
      cb();
    }
  });
}

describe('generate-readme', function() {
  if (!process.env.CI && !process.env.TRAVIS) {
    before(function(cb) {
      npm.maybeInstall('generate', cb);
    });
  }

  beforeEach(function() {
    app = generate({silent: true});
    app.cwd = actual();
    app.option('dest', actual());
    app.option('askWhen', 'not-answered');

    // provide template data to avoid prompts
    app.data(pkg);
    app.data({
      author: {
        name: 'Jon Schlinkert',
        username: 'jonschlnkert',
        url: 'https://github.com/jonschlinkert'
      }
    });
  });

  afterEach(function(cb) {
    del(actual(), cb);
  });

  describe('plugin', function() {
    it('should only register the plugin once', function(cb) {
      var count = 0;
      app.on('plugin', function(name) {
        if (name === 'generate-readme') {
          count++;
        }
      });
      app.use(generator);
      app.use(generator);
      app.use(generator);
      assert.equal(count, 1);
      cb();
    });

    it('should extend tasks onto the instance', function() {
      app.use(generator);
      assert(app.tasks.hasOwnProperty('default'));
      assert(app.tasks.hasOwnProperty('readme'));
    });

    it('should run the `default` task with .build', function(cb) {
      app.use(generator);
      app.build('default', exists('README.md', function(str) {
        return hasValues(str, [pkg.name, pkg.repository]);
      }, cb));
    });

    it('should run the `default` task with .generate', function(cb) {
      app.use(generator);
      app.generate('default', exists('README.md', function(str) {
        return hasValues(str, [pkg.name, pkg.repository]);
      }, cb));
    });
  });

  if (!process.env.CI && !process.env.TRAVIS) {
    describe('generator (CLI)', function() {
      before(function(cb) {
        symlink(__dirname, cb);
      });

      it('should run the default task using the `generate-readme` name', function(cb) {
        app.use(generator);
        app.generate('generate-readme', exists('README.md', function(str) {
          return hasValues(str, [pkg.name, pkg.repository]);
        }, cb));
      });

      it('should run the default task using the `readme` generator alias', function(cb) {
        app.use(generator);
        app.generate('readme', exists('README.md', function(str) {
          return hasValues(str, [pkg.name, pkg.repository]);
        }, cb));
      });
    });
  }

  describe('generator (API)', function() {
    it('should run the default task on the generator', function(cb) {
      app.register('readme', generator);
      app.generate('readme', exists('README.md', cb));
    });

    it('should run the `readme` task', function(cb) {
      app.register('readme', generator);
      app.generate('readme:readme', exists('README.md', cb));
    });

    it('should run the `default` task when defined explicitly', function(cb) {
      app.register('readme', generator);
      app.generate('readme:default', exists('README.md', cb));
    });
  });

  describe('sub-generator', function() {
    it('should work as a sub-generator', function(cb) {
      app.register('foo', function(foo) {
        foo.register('readme', generator);
      });
      app.generate('foo.readme', exists('README.md', cb));
    });

    it('should run the `generator:default` task when defined explicitly', function(cb) {
      app.register('foo', function(foo) {
        foo.register('readme', generator);
      });
      app.generate('foo.readme:default', exists('README.md', cb));
    });

    it('should run the `generator:node` task', function(cb) {
      app.register('foo', function(foo) {
        foo.register('readme', generator);
      });
      app.generate('foo.readme:node', exists('README.md', cb));
    });

    it('should run the `generator:minimal` task', function(cb) {
      app.register('foo', function(foo) {
        foo.register('readme', generator);
      });
      app.generate('foo.readme:minimal', exists('README.md', cb));
    });

    it('should run the `generator:readme` task', function(cb) {
      app.register('foo', function(foo) {
        foo.register('readme', generator);
      });
      app.generate('foo.readme:readme', exists('README.md', cb));
    });

    it('should work with nested sub-generators', function(cb) {
      app
        .register('foo', generator)
        .register('bar', generator)
        .register('baz', generator);

      app.generate('foo.bar.baz', exists('README.md', cb));
    });
  });
});
