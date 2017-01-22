module.exports = function (markdown) {
	var output;

	// Wrap sequences of moves with sequence tags and moves with move tags
	// @see http://www.regexr.com/3a93a
	var parser = new RegExp([
		// Capture the first move color
		'([wW]hite[\\s]?|[bB]lack[\\s]?|[wWbB][\\s]?)?',

		// Capture a sequence of moves
		'([a-hj-tA-HJ-T][0-1]?[0-9]\\b[; ]{0,2}){2,}',

		// Capture individual moves
		'|(\\b[a-hj-tA-HJ-T][0-1]?[0-9]\\b)'
	].join(''), 'g');

	output = markdown.replace(
		parser,
		function (match, color, insideMove, offset, string) {
			var str = match;
			var space = '';
			var firstMove = '';

			// Sequences have moves inside them; moves do not
			var type = (insideMove) ? 'sequence' : 'move';

			// Remove any trailing spaces from the series
			// I detest having a trailing space inside the tag rather than outside it
			// If I can write the regex to avoid this step, please let me know
			if (str.substring(str.length - 1) === ' ') {
				str = str.trim();
				space = ' ';
			}

			// If the first move has been specified, set it as the first-move attribute
			if (color) {
				str = str.substring(color.length);
				firstMove = (color.substring(0, 1).toUpperCase() === 'W') ? 'W' : 'B';
				firstMove = ' first-move="' + firstMove + '"';
			} else {
				color = '';
			}

			// Normalize the format of the sequence for easy parsing on the client side
			var sequence = '';
			if (type === 'sequence') {
				sequence = str.trim().replace(/[,; ]+/g, '-').toUpperCase();

				// Remove any trailing slashes
				if (sequence.substring(sequence.length - 1) === '-') {
					sequence = sequence.substring(0, sequence.length - 1);
				}

				sequence = ' sequence="' + sequence + '"';
			}

			return '<sgf-label' + firstMove + sequence + '>' + color + str + '</sgf-label>' + space;
		}
	);

	return output;
};
