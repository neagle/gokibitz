angular.module('gokibitz.directives')
.directive('uniqueUsername', function ($http) {
	return {
		restrict: 'A',
		require: 'ngModel',
		link: function (scope, element, attrs, ngModel) {
			function validate(value) {
				if (!value) {
					ngModel.$setValidity('unique', true);
					return;
				}
				$http.get('/auth/check_username/' + value).then(function (user) {
					ngModel.$setValidity('unique', !user.exists);
				});
			}

			scope.$watch(function () {
				return ngModel.$viewValue;
			}, validate);
		}
	};
});

