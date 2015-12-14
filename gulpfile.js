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
      // gulp.src(['./', cfg.dir.root.src, cfg.dir.type.source.views, 'favicon.ico'].join(''))
      //   .pipe(gulp.dest('./' + root + cfg.dir.type.destination.html));
    },
    resources: function () {
      // gulp.src(['./', cfg.dir.root.src, cfg.dir.type.source.resources, '*.*'].join(''))
      //   .pipe(gulp.dest('./' + root + cfg.dir.type.destination.resources));
    }
  }
};

var devActions = buildActions('dev');
var rcActions = buildActions('rc');
var prodActions = buildActions('production');

gulp.task('clean:dev', devActions.clean);
gulp.task('libs:dev', ['clean:dev'], devActions.concatLibs);
gulp.task('scripts:dev', ['clean:dev'], devActions.scripts);
gulp.task('styles:dev', ['clean:dev'], devActions.styles);
gulp.task('views:dev', ['clean:dev'], devActions.views);
gulp.task('resources:dev', ['clean:dev'], devActions.resources);

gulp.task('clean:rc', rcActions.clean);
gulp.task('libs:rc', ['clean:rc'], rcActions.concatLibs);
gulp.task('scripts:rc', ['clean:rc'], rcActions.scripts);
gulp.task('styles:rc', ['clean:rc'], rcActions.styles);
gulp.task('views:rc', ['clean:rc'], rcActions.views);
gulp.task('resources:rc', ['clean:rc'], rcActions.resources);

gulp.task('clean:prod', prodActions.clean);
gulp.task('libs:prod', ['clean:prod'], prodActions.concatLibs);
gulp.task('scripts:prod', ['clean:prod'], prodActions.scripts);
gulp.task('styles:prod', ['clean:prod'], prodActions.styles);
gulp.task('views:prod', ['clean:prod'], prodActions.views);
gulp.task('resources:prod', ['clean:prod'], prodActions.resources);

gulp.task('scripts', devActions.scripts);
gulp.task('styles', devActions.styles);
gulp.task('views', devActions.views);
gulp.task('resources', devActions.resources);

gulp.task('watch', function () {
  gulp.watch(['./', cfg.dir.root.src, cfg.dir.type.source.scripts, '**/*.@(jsx|js)'].join(''), ['scripts']);
  gulp.watch(['./', cfg.dir.root.src, cfg.dir.type.source.styles, '*.styl'].join(''), ['styles']);
  gulp.watch(['./', cfg.dir.root.src, cfg.dir.type.source.views, '[!_]*.jade'].join(''), ['views']);
  gulp.watch(['./', cfg.dir.root.src, cfg.dir.type.source.resources, '*.*'].join(''), ['resources']);
});

gulp.task('default', ['dev'], function () {});
gulp.task('dev', ['libs:dev', 'scripts:dev', 'styles:dev', 'views:dev', 'resources:dev'], function () {});
gulp.task('rc', ['libs:rc', 'scripts:rc', 'styles:rc', 'views:rc', 'resources:rc'], function () {});
gulp.task('prod', ['libs:prod', 'scripts:prod', 'styles:prod', 'views:prod', 'resources:prod'], function () {});