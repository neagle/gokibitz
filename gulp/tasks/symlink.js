var gulp = require('gulp');
var fs = require('fs');
var chalk = require('chalk');

// On windows, symbolic links need to be reconstructed after the project is cloned from git
// Thanks to oca for this code!
gulp.task('symlink', [], function () {
	var symlinks = [
		{
			src: __dirname + '/../../node_modules/wgo.js/wgo',
			dest: './client/src/js/lib/wgo',
			type: 'dir'
		},
		{
			src: __dirname + '/../../node_modules/wgo.js/themes/gokibitz/src/scss/gokibitz.scss',
			dest: './client/src/scss/lib/_gokibitz.scss',
			type: 'file'
		}
	];

	symlinks.forEach(function (symlink) {
		var exists = fs.existsSync(symlink.dest);
		var isSymlink;

		if (exists) {
			isSymlink = fs.lstatSync(symlink.dest);
		}

		if (!exists && !isSymlink) {
			console.log('Creating symlink: ' + chalk.yellow(symlink.src) + ' → ' + chalk.green(symlink.dest));

			fs.symlinkSync(symlink.src, symlink.dest, symlink.type);
		}
	});
});
