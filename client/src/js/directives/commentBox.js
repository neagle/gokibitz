angular.module('gokibitz.directives')
/**
 * Provides Facebook-style keyboard shortcuts for comment boxes.
 * Enter to submit, shift + enter for a regular carriage return,
 * and escape to cancel.
 */
.directive('gkCommentBox', function () {
	return {
		restrict: 'A',
		scope: {
			submit: '&gkCommentSubmit',
			cancel: '&gkCommentCancel'
		},
		link: function ($scope, element, attributes) {
			// Check for enter on keypress, so we can prevent its default action
			element.bind('keypress', function (event) {
				var key = event.keyCode || event.which;
				if (key === 13 && !event.shiftKey) {
					event.preventDefault();
					$scope.submit();
				}
			});

			// Escape only registers on keyup
			element.bind('keyup', function (event) {
				var key = event.keyCode || event.which;
				if (key === 27) {
					$scope.cancel();
				}
			});
		}
	};
});
