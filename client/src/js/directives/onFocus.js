angular.module('gokibitz.directives')
	.constant('focusConfig', {
		focusClass: 'focused'
	})
	.directive('onFocus', function (focusConfig) {
		return {
			restrict: 'A',
			require: 'ngModel',
			link: function (scope, element, attrs, ngModel) {
				ngModel.$focused = false;
				element
					.bind('focus', function (event) {
						element.addClass(focusConfig.focusClass);
						scope.$apply(function () {
							ngModel.$focused = true;
						});
					})
					.bind('blur', function (event) {
						element.removeClass(focusConfig.focusClass);
						scope.$apply(function () {
							ngModel.$focused = false;
						});
					});
			}
		};
	});
