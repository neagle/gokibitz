angular.module('gokibitz.directives')
/**
 * Provides Facebook-style keyboard shortcuts for comment boxes.
 * Enter to submit, shift + enter for a regular carriage return,
 * and escape to cancel.
 */
.directive('gkCommentBox', function ($http, $q, $document, $parse, pathFilter, Comment) {
	return {
		restrict: 'A',
		require: '?ngModel',

		link: function ($scope, element, attributes, ngModel) {
			var submit = $parse(attributes.gkCommentSubmit);
			var cancel = $parse(attributes.gkCommentCancel);
			var preview = attributes.gkCommentPreview;

			var text = element.val();
			var canceler;

			// Only display a preview if the preview attribute has been set
			var displayPreview = (attributes.gkCommentPreview) ? true : false;

			// Check if the element currently has focus
			var hasFocus = function () {
				return $document[0].activeElement === element[0];
			};

			// Get a preview of rendered HTML from comment markdown
			function getPreview() {
				if (element.val() !== text) {

					// Cancel any previous markdown calls
					if (canceler) {
						canceler.resolve();
					}

					text = element.val();

					// Create a deferred with which to timeout the call,
					// if need be (for instance, if the comment is submitted
					// before the preview comes back)
					canceler = $q.defer();

					// Get an HTML preview of the markdown
					$http.post('/api/markdown/', {
						markdown: element.val()
					}, {
						timeout: canceler.promise
					})
						.success(function (data) {
							$scope[preview] = data.markup;
						});
				}
			}

			// Prevent changes in the model that happen elsewhere (ie, a regularly
			// polling update) from updating more than the initial value of the
			// comment box
			if (attributes.gkCommentOneway) {
				ngModel.$render = function () {
					if (!hasFocus()) {
						element.val(ngModel.$viewValue);
					} else {
						ngModel.$setViewValue(element.val());
					}
				};
			}

			// Watch the value of the comment and fetch a preview when it changes
			if (displayPreview) {
				ngModel.$viewChangeListeners.push(function () {
					var value = ngModel.$modelValue;

					if (value !== $scope[preview]) {
						getPreview();
					}
				});
			}

			// Check for enter on keypress, so we can prevent its default action
			element.bind('keypress', function (event) {
				var key = event.keyCode || event.which;
				if (key === 13 && !event.shiftKey) {
					event.preventDefault();

					// Cancel any outstanding preview calls
					if (canceler) {
						canceler.resolve();
					}

					submit($scope);

					if (displayPreview) {
						$scope[preview] = '';
					}
				}
			});

			// Escape only registers on keyup
			element.bind('keyup', function (event) {
				var key = event.keyCode || event.which;
				// Escape cancels
				if (key === 27) {
					cancel($scope);
					// It's slightly mysterious to me why this is needed, but without it
					// there is sometimes (?) a delay in the cancel taking effect.
					$scope.$apply();
				}
			});
		}
	};
});
