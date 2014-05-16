var gulp = require('gulp');
var debug = require('gulp-debug');
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');
var bower = '/client/src/bower_components';

gulp.task('server-js', function () {
	return gulp.src('./server/**/*.js')
	.pipe(jshint('./.jshintrc'))
	.pipe(jshint.reporter(stylish));
});

gulp.task('default', ['server-js'], function () {
	// Nothing!
});
