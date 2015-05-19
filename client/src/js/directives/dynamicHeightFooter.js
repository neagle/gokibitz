angular.module('gokibitz.directives')
.directive('footer', function (debounce, $window, $document) {
		return {
			restrict: 'E',
			link: function(scope, element, attrs) {
				// Set the margin-bottom on body to accomodate a footer of arbitrary height
				function setMargin() {
					var height = element.outerHeight(true);
					$document[0].body.setAttribute('style', 'margin-bottom: ' + height + 'px');
				}

				$document.ready(function () {
					setMargin();
				});

				var w = angular.element($window);
				w.bind('resize', debounce(1000, setMargin));
			}
		};
});
