var gulp = require('gulp');

// testing
var istanbul  = require('gulp-istanbul');
var codecov   = require('gulp-codecov');
var mocha     = require('gulp-mocha');
var open      = require('gulp-open');
var karma     = require('karma');

//linting
var jshint = require('gulp-jshint');
var jshintStylish = require('jshint-stylish');

gulp.task('lint', function() {
  return gulp.src(['public/**/*.js', '!public/resources/**/*.js'])
    .pipe(jshint())
    .pipe(jshint.reporter(jshintStylish));
});

gulp.task('frontend-test', function(done) {
  return new karma.Server({
    configFile: __dirname + '/test/karma.conf.js',
    action: 'run',
    singleRun: true
  }, function() {
    done();  
  }).start();
});

gulp.task('open-frontend-coverage', ['frontend-test'], function() {
  return gulp.src('./test/coverage/jasmine/lcov/lcov-report/index.html')
    .pipe(open({ app: 'chrome' }));
});

gulp.task('prepare-istanbul-reporter', function() {
  return gulp.src(['server/*.js', 'server/**/*.js'])
    .pipe(istanbul({includeUntested: true}))
    .pipe(istanbul.hookRequire());
});

gulp.task('backend-test', ['prepare-istanbul-reporter'], function() {
  return gulp.src(['test/server/*.js'])
    .pipe(mocha())
    .pipe(istanbul.writeReports({ 
      reportOpts: {
        lcov: { dir: './test/coverage/mocha/lcov', file: 'lcov.info' }
      }
    })); 
});

gulp.task('open-backend-coverage', ['backend-test'], function() {
  return gulp.src('./test/coverage/mocha/lcov/lcov-report/index.html')
    .pipe(open({ app: 'chrome' }));
});

gulp.task('test:local', ['open-frontend-coverage', 'open-backend-coverage', 'lint'], function() {
  
})

gulp.task('test:ci', ['frontend-test', 'backend-test', 'lint'], function() {
  return gulp.src('./test/coverage/mocha/lcov/lcov.info')
    .pipe(codecov());
});

gulp.task('default', function() {
});