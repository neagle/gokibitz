var gulp = require('gulp');
var gutil = require('gulp-util');
var debug = require('gulp-debug');
//var concat = require('gulp-concat');
var sass = require('gulp-sass');
var bourbon = require('node-bourbon');
var autoprefix = require('gulp-autoprefixer');
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var nodemon = require('gulp-nodemon');
var livereload = require('gulp-livereload');
var notify = require('gulp-notify');
var imagemin = require('gulp-imagemin');
var newer = require('gulp-newer');
var glob = require('glob');
var fs = require('fs');
var path = require('path');

gulp.task('bootstrap-assets', function () {
	return gulp.src('./client/src/bower_components/bootstrap-sass-official/vendor/assets/fonts/**')
		.pipe(gulp.dest('./client/public/fonts'));
});

gulp.task('fonts', function () {
	return gulp.src('./client/src/assets/fonts/**')
		.pipe(gulp.dest('./client/public/fonts'));
});

gulp.task('js-assets', function () {
	return gulp.src('./client/src/assets/js/**')
		.pipe(gulp.dest('./client/public/js'));
});

gulp.task('images', function () {
	var imageSource = './client/src/assets/images/**';
	var imageDest = './client/public/images';

	return gulp.src(imageSource)
		.pipe(newer(imageDest))
		.pipe(imagemin())
		.pipe(gulp.dest(imageDest));
});

// Hack the ability to import directories in Sass
// Find any _all.scss files and write @import statements
// for all other *.scss files in the same directory
//
// Import the whole directory with @import "somedir/all";
gulp.task('sass-includes', function (callback) {
	var all = '_all.scss';
	glob('./client/src/scss/**/' + all, function (error, files) {
		files.forEach(function (allFile) {
			// Add a banner to warn users
			fs.writeFileSync(allFile, '/** This is a dynamically generated file **/\n\n');

			var directory = path.dirname(allFile);
			var partials = fs.readdirSync(directory).filter(function (file) {
				return (
					// Exclude the dynamically generated file
					file !== all &&
					// Only include _*.scss files
					path.basename(file).substring(0, 1) === '_' &&
					path.extname(file) === '.scss'
				);
			});

			// Append import statements for each partial
			partials.forEach(function (partial) {
				fs.appendFileSync(allFile, '@import "' + partial + '";\n');
			});
		});
	});

	callback();
});

gulp.task('sass', ['sass-includes'], function () {
	return gulp.src('./client/src/scss/app.scss')
	.pipe(sass({
		includePaths: bourbon.includePaths,
		errLogToConsole: true
	}))
	.pipe(autoprefix())
	.pipe(gulp.dest('./client/public/css'));
});

gulp.task('browserify', function () {
	return browserify({
		entries: ['./client/src/js/app.js']
	})
	.bundle({ debug: true })
	.on('error', notify.onError({
		title: 'Browserify Error',
		message: '<%= error.message %>'
	}))
	.on('error', function (e) {
		gutil.log(e);
		this.emit('end');
	})
	.pipe(source('app.js'))
	.pipe(gulp.dest('./client/public/js/'));
});

// Lint our server-side JS
gulp.task('lint-server-js', function () {
	return gulp.src('./server/**/*.js')
	.pipe(jshint('./.jshintrc'))
	.pipe(jshint.reporter(stylish));
});

gulp.task('default', [
	'lint-server-js',
	'sass',
	'browserify',
	'fonts',
	'js-assets',
	'images',
	'bootstrap-assets'
], function () {
	// Nothing!
});

gulp.task('watch', ['default'], function () {
	var server = livereload();

	nodemon({
		script: './server/bin/www',
		ext: 'js jade',
		watch: ['server', 'server.js'],
		env: {
			DEBUG: 'gokibitz',
			PORT: 3434
		}
	})
		.on('change', ['lint-server-js']);

	gulp.watch('client/src/scss/**/!(_all).scss', ['sass']);
	gulp.watch('client/src/js/**/*.js', ['browserify']);
	gulp.watch('client/src/submodules/wgo.js/wgo/src/*.js', ['browserify']);
	gulp.watch('client/src/assets/fonts/**/*', ['fonts']);
	gulp.watch('client/src/assets/images/**/*', ['images']);
	gulp.watch('client/src/assets/js/**/*', ['js-assets']);

	gulp.watch('client/public/**').on('change', function (file) {
		server.changed(file.path);
	});
});
