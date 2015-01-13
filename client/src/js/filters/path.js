angular.module('gokibitz.filters')
.filter('path', function () {
	return function (input, outputType, verbose) {
		var output;

		// If no output type has been specified, try to set it to the
		// opposite of the input
		if (typeof outputType === 'undefined') {
			outputType = (typeof input === 'string') ? 'object' : 'string';
		}

		/**
		 * Turn a path object into a string.
		 */
		function stringify(input) {
			if (typeof input === 'string') {
				return input;
			}

			if (!input) {
				return '';
			}

			output = input.m;

			var variations = [];
			for (var key in input) {
				if (input.hasOwnProperty(key) && key !== 'm') {
					// Only show variations that are not the primary one, since
					// primary variations are chosen by default
					if (input[key] > 0) {
						if (verbose) {
							variations.push(', variation ' + input[key] + ' at move ' + key);
						} else {
							variations.push('-' + key + ':' + input[key]);
						}
					}
				}
			}

			output += variations.join('');
			return output;
		}

		/**
		 * Turn a path string into an object.
		 */
		function parse(input) {
			if (typeof input === 'object') {
				input = stringify(input);
			}

			if (!input) {
				return { m: 0 };
			}

			var path = input.split('-');
			output = {
				m: Number(path.shift())
			};

			if (path.length) {
				path.forEach(function (variation, i) {
					variation = variation.split(':');
					output[Number(variation[0])] = variation[1];
				});
			}

			return output;
		}

		if (outputType === 'string') {
			output = stringify(input);
		} else if (outputType === 'object') {
			output = parse(input);
		} else {
			output = undefined;
		}

		return output;
	};
});
