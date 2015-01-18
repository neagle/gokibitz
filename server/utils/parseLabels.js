module.exports = function (markdown) {
	var output = markdown.replace(
		/([a-hj-tA-HJ-T][0-1]?[0-9])\b/g,
		'<b class="wgo-move-link">$1</b>'
	);

	return output;
};
