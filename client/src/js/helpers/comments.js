var parseLabels = require('../../../../server/utils/parseLabels.js');
var linkMoves = require('../../../../server/utils/linkMoves.js');

module.exports = {
	format: function (comment) {
		// to avoid XSS we must transform < and > to entities, it is highly
		// recommended not to change it
		if (!comment || typeof comment !== 'string') {
			return comment;
		} else {
			// Strip out tags to prevent XSS
			var html = comment.replace(/</g, '&lt;').replace(/>/g, '&gt;');

			// Replace line breaks with paragraph tags
			html = '<p>' + comment.replace(/\n/g, '</p><p>') + '</p>';

			// Format nicknames
			html = html.replace(
				/(<p>)([^:\s]{3,}(\s\[[^:\]]*\])?:)/g,
				'<p><span class="wgo-comments-nick">$2</span> '
			);

			// Format move and sequence labels
			html = linkMoves(html);
			html = parseLabels(html);

			return html;
		}
	}
};
