'use strict';

var isValid = require('is-valid-app');

module.exports = function(app) {
  // return if the generator is already registered
  if (!isValid(app, 'generate-readme')) return;

  /**
   * Plugins
   */

  app.use(require('generate-collections'));
  app.use(require('generate-defaults'));

  /**
   * Generate a `README.md` in the current working directory.
   *
   * ```sh
   * $ gen readme:readme
   * ```
   * @name readme:readme
   * @api public
   */

  task(app, 'readme', 'templates/README.md');
  app.task('default', ['readme']);
};

/**
 * Create a task with the given `name` and glob `pattern`
 */

function task(app, name, pattern) {
  app.task(name, function() {
    return app.src(pattern, {cwd: __dirname})
      .pipe(app.renderFile('*')).on('error', console.log)
      .pipe(app.conflicts(app.cwd)).on('error', console.log)
      .pipe(app.dest(app.cwd)).on('error', console.log)
  });
}
