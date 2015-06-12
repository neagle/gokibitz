var gulp = require('gulp');

gulp.task('default', [
	'lint',
	'code-style',
	'sass',
	'uglify',
	'fonts',
	'js-assets',
	'images',
	'bootstrap-assets'
]);
