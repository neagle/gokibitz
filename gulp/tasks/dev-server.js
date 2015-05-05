var gulp = require('gulp');
var server = require('gulp-develop-server');

gulp.task('server:start', function () {
	server.listen({
		path: './server/bin/www',
		env: {
			DEBUG: 'gokibitz',
			PORT: 3434
		}
	});
});

gulp.task('server:restart', function () {
	server.restart();
});
