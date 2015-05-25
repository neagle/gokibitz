var gulp = require('gulp');
var jscs = require('gulp-jscs');
var config = require('../config').js;

gulp.task('code-style', function () {
	return gulp.src(config.files)
		.pipe(jscs());
});
