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
	production: {
		cssSrc: dest + '/css/*.css',
		cssDest: dest + '/css',
		jsSrc: dest + '/js/*.js',
		jsDest: dest + '/js',
		dest: dest
	}
};
