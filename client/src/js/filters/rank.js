angular.module('gokibitz.filters')
.filter('rank', function () {
	return function (input) {
		var number = /^[0-9]+/.exec(input);
		var qualification = /[a-zA-Z]+/.exec(input);

		if (!number || !qualification) {
			return '';
		}

		var lowerQualification = qualification[0].toLowerCase();

		if (lowerQualification.indexOf('k') > -1) {
			return number[0] + 'k';
		}
		if (lowerQualification.indexOf('d') > -1) {
			return number[0] + 'd';
		}
		if (lowerQualification.indexOf('p') > -1) {
			return number[0] + 'p';
		}

		return '';
	};
});
