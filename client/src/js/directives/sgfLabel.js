angular.module('gokibitz.directives')
.directive('sgfLabel', function ($document, $timeout) {
	return {
		restrict: 'E',
		link: function ($scope, element, attributes) {

			element.bind('click', function (event) {
				// Clear off any existing sequences
				$scope.player.removeSequence();

				// Remove active class from any active labels
				var active = $document[0].querySelectorAll('sgf-label.active');

				var currentlyActive = angular.element(event.target).hasClass('active');

				if (active.length) {
					for (var i = 0, length = active.length; i < length; i += 1) {
						var $elem = angular.element(active[i]);
						$elem.removeClass('active');
					}
				}

				if (!currentlyActive) {
					element.addClass('active');

					if (attributes.sequence) {
						$scope.player.displaySequence(attributes.sequence, attributes.firstMove);
					}
				} else {
					$scope.player.update();
				}
			});

			element.bind('mouseover', function (event) {
				if (!attributes.sequence) {
					$scope.player.mark(event.target.innerHTML);
				}
			});

			element.bind('mouseout', function (event) {
				if (!attributes.sequence) {
					$scope.player.unmark();
				}
			});
		}
	};
});
