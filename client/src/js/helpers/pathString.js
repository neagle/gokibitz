module.exports = {
	stringify: function (path) {
		var stringPath;

		for (var key in path) {
			if (path.hasOwnProperty(key)) {
				path[key] = Number(path[key]);
			}
		}

		stringPath = JSON.stringify(path);
		return stringPath;
	},

	parse: function (pathString) {
		return JSON.parse(pathString);
	}
};
