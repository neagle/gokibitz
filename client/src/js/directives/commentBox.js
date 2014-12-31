angular.module('gokibitz.directives')
/**
 * Provides Facebook-style keyboard shortcuts for comment boxes.
 * Enter to submit, shift + enter for a regular carriage return,
 * and escape to cancel.
 */
.directive('gkCommentBox', function ($http) {
	return {
		restrict: 'A',
		require: '?ngModel',
		scope: {
			submit: '&gkCommentSubmit',
			cancel: '&gkCommentCancel',
			preview: '=gkCommentPreview'
		},
		link: function ($scope, element, attributes, ngModel) {
			var text = element.val();

			// Prevent changes in the model that happen elsewhere (ie, a regularly
			// polling update) from updating more than the initial value of the
			// comment box
			if (attributes.gkCommentOneway) {
				ngModel.$render = function () {
					var hasFocus = document.activeElement === element[0];
					if (!hasFocus) {
						element.val(ngModel.$viewValue);
					} else {
						ngModel.$setViewValue(element.val());
					}
				};
			}

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
				} else {
					if (element.val() !== text) {
						text = element.val();

						// Get an HTML preview of the markdown
						$http.post('/api/markdown/', {markdown: element.val()})
							.success(function (data) {
								$scope.preview = data.markup;
							});
					}
				}
			});
		}
	};
});
