var gulp = require('gulp');
var stylus = require('gulp-stylus');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var jade = require('gulp-jade');
var source = require('vinyl-source-stream');
var runsequence = require('run-sequence');
var browserify = require('browserify');
var del = require('del');
var nib = require('nib');
var stream = require('stream');
var _ = require('lodash');

var argv = require('minimist')(process.argv.slice(2));
var cfg = require('./cfg.json');
var gulputil = require('./gulputil.js');

var _devEnvironment = {
  name: 'dev',
  root: cfg.dir.root.dev,
  appFilename: 'app.js',
  libFilename: 'lib.js',
  appConfiguration: cfg.appConfigurations.default
};
var _localhostEnvironment = {
  name: 'localhost',
  appConfiguration: _.assign({}, cfg.appConfigurations.default , cfg.appConfigurations.localhost)
};

var _productionEnvironment = {
  name: 'production',
  root: cfg.dir.root.production,
  appFilename: gulputil.buildCacheBusterString(7) + '.js',
  libFilename: gulputil.buildCacheBusterString(8) + '.js',
  appConfiguration: cfg.appConfigurations.production
};


var environment = _.assign({}, _devEnvironment);

gulp.task('clean', function () {
  return del([environment.root]);
});

gulp.task('libraries', function () {
  return Promise.all(_.map(cfg.bowerLibraryFilePaths, function (path) {
    return gulputil.pIsFileAvaliable(path).then(function (isAvaliable) {
      return {
        filePath: path,
        isAvaliable: isAvaliable
      };
    });
  })).then(function (results) {
    _.forEach(results, function (r) {
      if (!r.isAvaliable) { console.error('Cannot find library file at: ' + r.filePath); }
    });
  }).then(function () {
    return gulp.src(cfg.bowerLibraryFilePaths)
      .pipe(uglify())
      .pipe(concat(environment.libFilename))
      .pipe(gulp.dest(environment.root + cfg.dir.type.destination.js));
  });
});

gulp.task('scripts', function () {

  var configStream = new stream.Readable();
  configStream.push('module.exports=' + JSON.stringify(environment.appConfiguration));
  configStream.push(null);

  var scriptSourceDir = cfg.dir.root.src + cfg.dir.type.source.scripts;
  var b = browserify({
    entries: scriptSourceDir + 'app.jsx',
    extensions: ['.js', '.jsx'],
    paths: [scriptSourceDir]
  }).exclude('appconfiguration')
    .require(configStream, {expose: 'appconfiguration', basedir: './src/scripts'});

  return b.transform('babelify', {presets: ['react']})
    .bundle()
    .on('error', function (err) {
      console.error(err.toString());
      this.emit('end');
    })
    .pipe(source(environment.appFilename))
    .pipe(gulp.dest(environment.root + cfg.dir.type.destination.js));

});

gulp.task('styles', function () {
  return gulp.src(cfg.dir.root.src + cfg.dir.type.source.styles + '[!_]*.styl')
    .pipe(stylus({
      use: [nib()],
      define: {"app-environment": environment.name}
    }))
    .pipe(gulp.dest(environment.root + cfg.dir.type.destination.css));
});

gulp.task('views', function () {
  return gulp.src(cfg.dir.root.src + cfg.dir.type.source.views + '[!_]*.jade')
    .pipe(jade({
      pretty: true,
      data: {
        js_appFile: 'js/' + environment.appFilename,
        js_libFile: 'js/' + environment.libFilename
      }
    }))
    .pipe(gulp.dest(environment.root + cfg.dir.type.destination.html));
});

gulp.task('resources', function () {
  return gulp.src(cfg.dir.root.src + cfg.dir.type.source.resources + '*.*')
    .pipe(gulp.dest(environment.root + cfg.dir.type.destination.assets));
});

gulp.task('watch', function () {
  if (_.includes(_.keys(argv), 'localhost')) {
    environment = _.assign({}, environment, _localhostEnvironment);
  }

  var paths = cfg.dir.type.source;
  var root = cfg.dir.root.src;

  gulp.watch(root + paths.scripts + '**/*.@(jsx|js)', ['scripts']);
  gulp.watch(root + paths.styles + '*.styl', ['styles']);
  gulp.watch(root + paths.views + '*.jade', ['views']);
  gulp.watch(root + paths.resources + '*.*', ['resources']);

});

gulp.task('build', function () {
  runsequence('clean', ['libraries', 'scripts', 'styles', 'views', 'resources']);
});

gulp.task('dev', function () {
  if (_.includes(_.keys(argv), 'localhost')) {
    environment = _.assign({}, environment, _localhostEnvironment);
  }
  if (gulp.tasks.build) return gulp.start('build');
  else throw new Error('No build task found');
});

gulp.task('production', function () {
  environment = _.assign({}, environment, _productionEnvironment);
  if (gulp.tasks.build) return gulp.start('build');
  else throw new Error('No build task found');
});

gulp.task('default', ['dev']);