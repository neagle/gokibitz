var dest = './client/public';
var src = './client/src';

module.exports = {
	browserify: {
		bundleConfigs: [{
			entries: src + '/js/app.js',
			dest: dest + '/js',
			outputName: 'app.js'
		}]
	},
	js: {
		jshintrc: './.jshintrc',
		files: [
			'./server.js',
			'./server/**/*.js',
			'./client/src/js/**/*.js',
			// Third-party scripts in lib get a pass: they don't have
			// to play by our rules!
			'!./client/src/js/lib/**'
		]
	},
	production: {
		cssSrc: dest + '/css/*.css',
		cssDest: dest + '/css',
		jsSrc: dest + '/js/*.js',
		jsDest: dest + '/js',
		dest: dest
	}
};
