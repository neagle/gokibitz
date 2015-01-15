angular.module('gokibitz.directives')
.directive('iframeResizer', function ($rootScope, $window, $document, debounce) {
	return {
		restrict: 'A',
		link: function ($scope, elem, attrs) {
			var height, newHeight;

			// Check to see if we're in an iframe
			if (typeof $rootScope.iframed === 'undefined') {
				if ($window.self !== $window.top) {
					$rootScope.iframed = true;
				}
			}

			var notify = debounce(500, function () {
				$window.parent.postMessage(newHeight, '*');
			});

			if ($rootScope.iframed) {
				// Watch html for height changes, sending a notification whenever
				// they happen
				var container = $window.document.getElementById('container');
				$scope.$watch(function () {
					newHeight = container.scrollHeight;
					if (height !== newHeight) {
						notify();
						height = newHeight;
					}
				});
			}
		}
	};
});
