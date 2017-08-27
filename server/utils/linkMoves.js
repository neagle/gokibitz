// Wrap "move XX" in a custom tag
module.exports = function (markdown) {
	let output = markdown.replace(/\bmove ([\d]{1,3})\b/gi, (match, move, offset, string) => {
		return `<move num="${move}">${match}</move>`;
	});

	return output;
};
