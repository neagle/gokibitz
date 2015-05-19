var gulp = require('gulp');
var gutil = require('gulp-util');
var debug = require('gulp-debug');
var sass = require('gulp-sass');
var bourbon = require('node-bourbon');
var autoprefix = require('gulp-autoprefixer');
var notify = require('gulp-notify');
var imagemin = require('gulp-imagemin');
var newer = require('gulp-newer');
var glob = require('glob');
var fs = require('fs');
var path = require('path');
var requireDir = require('require-dir');

// Require all tasks in gulp/tasks, including subfolders
 requireDir('./gulp/tasks', { recurse: true });

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
	.pipe(autoprefix()
			.on('error', notify.onError({
				title: 'Autoprefix Error',
				message: '<%= error.message %>'
			}))
		)
	.pipe(gulp.dest('./client/public/css'));
});

gulp.task('default', [
	'lint',
	'sass',
	'uglify',
	'fonts',
	'js-assets',
	'images',
	'bootstrap-assets'
], function () {
	// Nothing!
});
