var gulp = require('gulp');
var config = require('../config').production;
//var size = require('gulp-filesize');
var size = require('gulp-size');
var uglify = require('gulp-uglify');

gulp.task('uglify', ['browserify'], function() {
	return gulp.src(config.jsSrc)
		.pipe(size({
			title: 'Unminified',
			showFiles: true
		}))
		.pipe(uglify())
		.pipe(gulp.dest(config.jsDest))
		.pipe(size({
			title: 'Minified',
			showFiles: true
		}))
		.pipe(size({
			title: 'Compressed',
			showFiles: true,
			gzip: true
		}));
});
