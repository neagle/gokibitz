module.exports = {
	format: function (comment) {
		// to avoid XSS we must transform < and > to entities, it is highly recomanded not to change it
		//.replace(/</g,"&lt;").replace(/>/g,"&gt;") : "";
		if (!comment || typeof comment !== 'string') {
			return comment;
		} else {
			// Strip out tags to prevent XSS
			var html = comment.replace(/</g, '&lt;').replace(/>/g, '&gt;');

			// Replace line breaks with paragraph tags
			html = '<p>' + comment.replace(/\n/g, '</p><p>') + '</p>';

			// Format nicknames
			html = html.replace(/(<p>)([^:\s]{3,}:)\s/g, '<p><span class="wgo-comments-nick">$2</span> ');

			// Format moves
			html = html.replace(/\b[a-zA-Z]1?\d\b/g, '<b class="wgo-move-link">$&</b>');

			return html;
		}
	}
};
