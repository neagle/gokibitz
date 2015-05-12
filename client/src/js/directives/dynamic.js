// Add content to elements that needs to be compiled by Angular
// ie, things that contain directives, etc.
angular.module('gokibitz.directives')
.directive('dynamic', function ($compile) {
	return {
		restrict: 'A',
		link: function ($scope, element, attributes) {
			$scope.$watch(attributes.dynamic, function(html) {
				element.html(html || '');
				$compile(element.contents())($scope);
			});
		}
	};
});

