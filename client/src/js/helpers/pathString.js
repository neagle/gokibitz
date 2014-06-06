module.exports = {
	stringify: function (path, verbose) {
		if (typeof path === 'string') {
			return path;
		}

		var stringPath = path.m;

		var variations = [];
		for (var key in path) {
			if (path.hasOwnProperty(key) && key !== 'm') {
				if (path[key] > 0) {
					if (verbose) {
						variations.push(', variation ' + path[key] + ' at move ' + key);
					} else {
						variations.push('-' + key + ':' + path[key]);
					}
				}
			}
		}

		stringPath += variations.join('');

		//console.log('stringPath', stringPath);
		return stringPath;
	},

	parse: function (pathString) {
		if (typeof pathString !== 'string') {
			return pathString;
		}

		var path = pathString.split('-');
		var pathObject = {
			m: path.shift()
		};

		if (path.length) {
			path.forEach(function (variation, i) {
				variation = variation.split(':');
				pathObject[Number(variation[0])] = variation[1];
			});
		}

		//console.log('path object', pathObject);
		return pathObject;
		//return JSON.parse(decodeURIComponent(pathString));
	}
};
