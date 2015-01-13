angular.module('gokibitz.filters')
.filter('markCoordinates', function () {
	return function (input) {
		var output = input.replace(
			/([^<\/])([a-tA-T][0-1]?\d)/g,
			'$1<b class="wgo-move-link">$2</b>'
		);
		return output;
	};
});
