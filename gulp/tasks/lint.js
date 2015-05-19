var gulp = require('gulp');
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');
var config = require('../config').js;

gulp.task('lint', function () {
	return gulp.src(config.files)
	.pipe(jshint(config.jshintrc))
	.pipe(jshint.reporter(stylish))
	.pipe(jshint.reporter('fail'));
});
