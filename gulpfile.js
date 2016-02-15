var gulp = require('gulp');
var jasmine = require('gulp-jasmine');
var istanbul = require('gulp-istanbul');
var coveralls = require('gulp-coveralls');
var jscs = require('gulp-jscs');

var paths = {
    code: ['./lib/**/*.js'],
    spec: ['./spec/**/*.spec.js'],
    coverageReport: 'coverage/lcov.info'
};

gulp.task('jscs', function() {
    return gulp
        .src([
            './lib/**/*.js',
            //'./spec/**/*.js'
        ])
        .pipe(jscs())
        .pipe(jscs.reporter())
        .pipe(jscs.reporter('fail'));
});

gulp.task('jasmine', function() {
    return gulp
        .src(paths.spec)
        .pipe(jasmine({
            includeStackTrace: true,
            verbose: true
        }));
});

gulp.task('coveralls', ['coverage'], function() {
    return gulp.src(paths.coverageReport).pipe(coveralls());
});

gulp.task('coverage', function(cb) {
    gulp
        .src(paths.code)
        .pipe(istanbul()) // Covering files
        .pipe(istanbul.hookRequire()) // Force `require` to return covered files
        .on('finish', function() {
            gulp
                .src(paths.spec)
                .pipe(jasmine())
                .pipe(istanbul.writeReports())
                .on('end', cb);
        });
});

gulp.task('pre-commit', ['jscs']);

gulp.task('test', ['jasmine']);
gulp.task('default', ['test']);
