'use strict';

var isValid = require('is-valid-app');

module.exports = function(app) {
  if (!isValid(app, 'generate-readme')) return;

  /**
   * Plugins
   */

  app.use(require('generate-defaults'));

  /**
   * Alias for the [readme:node](#node) task, to allow this generator to be
   * run with the following command:
   *
   * ```sh
   * $ gen readme
   * $ gen readme --dest ./docs
   * ```
   * @name default
   * @api public
   */

  app.task('default', ['readme-node']);
  app.task('readme', ['readme-node']);

  /**
   * Generate a basic `README.md` for a node.js project to the current working
   * directory or specified `--dest`.
   *
   * ```sh
   * $ gen readme:node
   * $ gen readme:node --dest ./docs
   * ```
   * @name node
   * @api public
   */

  app.task('node', ['readme-node']);
  app.task('readme-node', function() {
    return file(app, 'node');
  });

  /**
   * Generate a minimal `README.md` to the current working directory or specified `--dest`.
   * Also aliased as `readme-minimal` to provide a semantic task name for plugin usage.
   *
   * ```sh
   * $ gen readme:min
   * ```
   * @name min
   * @api public
   */

  app.task('min', ['readme-minimal']);
  app.task('minimal', ['readme-minimal']);
  app.task('readme-minimal', function() {
    return file(app, 'minimal');
  });
};

/**
 * Generate a file
 */

function file(app, name) {
  return app.src(`templates/${name}.md`, { cwd: __dirname })
    .pipe(app.renderFile('*'))
    .pipe(app.conflicts(app.cwd))
    .pipe(app.dest(app.cwd));
}
