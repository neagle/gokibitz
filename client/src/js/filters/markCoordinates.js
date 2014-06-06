angular.module('gokibitz.filters')
.filter('markCoordinates', function () {
	return function (input) {
		var output = input.replace(
			/\b[a-zA-Z]1?\d\b/g,
			'<b class="wgo-move-link">$&</b>'
		);
		return output;
	};
});
