var gulp = require('gulp');
var config = require('../config');

gulp.task('watch', ['server:start', 'watchify'], function () {
	gulp.watch('client/src/scss/**/!(_all).scss', ['sass']);
	gulp.watch('client/src/assets/fonts/**/*', ['fonts']);
	gulp.watch('client/src/assets/images/**/*', ['images']);
	gulp.watch('client/src/assets/js/**/*', ['js-assets']);
	gulp.watch(config.js.files, ['lint', 'code-style']);

	gulp.watch([
		'server/**/*',
		'server.js'
	], ['server:restart']);
});
