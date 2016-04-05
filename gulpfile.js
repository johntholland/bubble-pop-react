var gulp = require('gulp');
var stylus = require('gulp-stylus');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var jade = require('gulp-jade');
var source = require('vinyl-source-stream');
var browserify = require('browserify');
var del = require('del');
var nib = require('nib');

var cfg = require('./cfg.json');
var gulputil = require('./gulputil.js');

var buildActions = function (environment) {

  var jsAppFilename = environment === 'dev' ? 'app.js' : gulputil.buildCacheBusterString(10) + '.js';
  var jsLibFilename = environment === 'dev' ? 'lib.js' : gulputil.buildCacheBusterString(8) + '.js';

  var paths = gulputil.buildPaths(cfg, environment);

  return {
    clean: function () {
      return del([paths.root]);
    },
    concatLibs: function () {
      gulp.src(cfg.bowerLibraryFilePaths)
        .pipe(uglify())
        .pipe(concat(jsLibFilename))
        .pipe(gulp.dest(paths.js));
    },
    scripts: function () {
      var b = browserify({
        entries: paths.scripts + 'app.jsx',
        extensions: ['.js', '.jsx'],
        paths: [paths.scripts]
      });
      b.transform('babelify', {presets: ['react']})
        .bundle()
        .on('error', function (err) {
          console.error(err.toString());
          this.emit('end');
        })
        .pipe(source(jsAppFilename))
        .pipe(gulp.dest(paths.js));
    },
    styles: function () {
      gulp.src(paths.styles + '[!_]*.styl')
        .pipe(stylus({use: [nib()]}))
        .pipe(gulp.dest(paths.css));
    },
    views: function () {
      gulp.src(paths.views + '[!_]*.jade')
        .pipe(jade({
          pretty: true,
          data: {
            js_appFile: 'js/' + jsAppFilename,
            js_libFile: 'js/' + jsLibFilename
          }
        }))
        .pipe(gulp.dest(paths.html));
    },
    resources: function () {
      gulp.src(paths.resources + '*.*')
        .pipe(gulp.dest(paths.assets));
    }
  }
};

var devActions = buildActions('dev');
var rcActions = buildActions('rc');
var prodActions = buildActions('production');

var createBuildTaskSet = function (actionSource, environment, taskNameExtension) {
	var ext = taskNameExtension;

	gulp.task('clean:' + ext, actionSource.clean);
	gulp.task('libs:' + ext, ['clean:' + ext], actionSource.concatLibs);
	gulp.task('scripts:' + ext, ['clean:' + ext], actionSource.scripts);
	gulp.task('styles:' + ext, ['clean:' + ext], actionSource.styles);
	gulp.task('views:' + ext, ['clean:' + ext], actionSource.views);
	gulp.task('resources:' + ext, ['clean:' + ext], actionSource.resources);
}

createBuildTaskSet(devActions, 'dev', 'dev');
createBuildTaskSet(rcActions, 'rc', 'rc');
createBuildTaskSet(prodActions, 'production', 'prod');

gulp.task('scripts:watch', devActions.scripts);
gulp.task('styles:watch', devActions.styles);
gulp.task('views:watch', devActions.views);
gulp.task('resources:watch', devActions.resources);

gulp.task('watch',(function() {
	var paths = gulputil.buildPaths(cfg, 'dev');
	return function () {
	  gulp.watch(paths.scripts + '**/*.@(jsx|js)', ['scripts:watch']);
	  gulp.watch(paths.styles + '*.styl', ['styles:watch']);
	  gulp.watch(paths.views + '*.jade', ['views:watch']);
	  gulp.watch(paths.resources + '*.*', ['resources:watch']);
	};
})());

gulp.task('default', ['dev'], function () {});
gulp.task('dev', ['libs:dev', 'scripts:dev', 'styles:dev', 'views:dev', 'resources:dev'], function () {});
gulp.task('rc', ['libs:rc', 'scripts:rc', 'styles:rc', 'views:rc', 'resources:rc'], function () {});
gulp.task('prod', ['libs:prod', 'scripts:prod', 'styles:prod', 'views:prod', 'resources:prod'], function () {});