var _ = require('lodash');
var getCaretCoordinates = require('textarea-caret');

angular.module('gokibitz.directives')
/**
 * Let users @mention other users in comments
 */
.directive('gkMention', function ($timeout, $window, $compile, $http, $q, $document, $parse, pathFilter, Comment) {
	return {
		restrict: 'A',
		require: '?ngModel',
		link: function ($scope, element, attributes, ngModel) {
			var elementText = '';
			var lastRegexp = /[^ ,.;'"\[\]\{\}]+$/;

			var userList = angular.element('<div class="mention-user-list" />');
			userList.append(
					'<div class="media" ng-class="{ selected: selected === $index }" ' +
						'ng-repeat="user in users track by user._id" ' +
						'ng-click="selectUser(user)">' +
					'<div class="media-left">' +
						'<img class="media-object" ng-src="{{:: user.gravatar }}?s=24&d=retro">' +
					'</div>' +
					'<div class="media-body">' +
						'<h4 class="media-heading">' +
							'<span class="name">{{ user.username }}</span>' +
							'<span class="rank">{{ user.rank }}</span>' +
						'</h4>' +
					'</div>'
			);
			$compile(userList)($scope);
			element.after(userList);

			$scope.$watch('users', function(newValue, oldValue) {
				if (_.isEmpty(newValue)) {
					element.unbind('keydown', moveSelection);
				} else {
					element.bind('keydown', moveSelection);
				}
			});

			function keyup(event) {
				var text = element.val();

				if (text === elementText) {
					return;
				} else {
					elementText = text;
				}

				function stop() {
					$scope.users = [];
					$scope.$apply();
				}

				if (!text.length) {
					return stop();
				}

				var lastBit = element.val().match(lastRegexp);

				if (_.isEmpty(lastBit)) {
					return stop();
				} else {
					lastBit = lastBit[0];
					if (lastBit.substring(0, 1) === '@') {
						$scope.searchText = lastBit.substring(1);
						searchUsers();

					} else {
						return stop();
					}
				}
			}

			/* Position the list of users */
			function positionList() {
				var cursor = element.prop('selectionEnd') - ($scope.searchText.length + 1);
				var position = {
					top: element.prop('offsetTop'),
					left: element.prop('offsetLeft')
				};
				var coordinates = getCaretCoordinates(element[0], cursor);

				elementStyle = $window.getComputedStyle(element[0]);
				listStyle = $window.getComputedStyle(userList[0]);

				var lineHeight = parseInt(elementStyle.lineHeight, 10);
				var elementWidth = element[0].clientWidth;
				var elementOffsetLeft = element[0].offsetLeft;
				var left = position.left + coordinates.left;

				userList.css({
					top: position.top + coordinates.top + lineHeight + 'px',
					left: left + 'px'
				});

				var userListWidth = userList[0].clientWidth;

				var rightEdge = elementWidth + elementOffsetLeft - parseInt(elementStyle.paddingRight, 10);

				// Find out how much the user list is over the right edge, if at all
				var overage = rightEdge - (left + userListWidth);

				// If it's over the right edge, budge it back
				if (overage < 0) {
					left += overage;

					userList.css({
						left: left + 'px'
					});
				}
			}

			function searchUsers() {
				// Don't search until we have at least two characters to go on
				if ($scope.searchText.length < 2) {
					$scope.users = [];
					return false;
				}

				$http.get('api/user/list?search=' + $scope.searchText)
					.success(function (data) {
						$scope.users = data.map(function (user) {
							user.label = user.username;
							return user;
						});

						// If we only got one result, and it's the same as the text that's been
						// entered, no need to show the list. There's nothing to do.
						if ($scope.users.length === 1) {
							if ($scope.users[0].username === $scope.searchText) {
								$scope.users = [];
							}
						}

						$scope.selected = 0;
						positionList();
					}).error(function (data, status, headers, config) {
				});
			}

			var selectUser = $scope.selectUser = function (user, extra) {
				extra = typeof extra === 'undefined' ? '' : extra;

				var text = element.val();
				var lastBit = text.match(lastRegexp);

				if (_.isEmpty(lastBit)) {
					return;
				} else {
					lastBit = lastBit[0];
				}

				if (lastBit.substring(0, 1) === '@') {
					element.val(text.substring(0, text.length - (lastBit.length - 1)) + user.username + extra);

					// This needs to be set to make the preview update
					ngModel.$setViewValue(element.val());
					$scope.users = [];
					element[0].focus();
				}
			};

			function moveSelection(event) {
				if (!_.isEmpty($scope.users)) {
					var up = (event.which === 38);
					var down = (event.which === 40);
					var enter = (event.which === 13);
					var punctuation = ([188, 186, 190, 191, 222].indexOf(event.which) !== -1);

					if (up) {
						event.preventDefault();
						$scope.selected = ($scope.selected === 0)
							? $scope.users.length - 1
							: $scope.selected - 1;
						$scope.$apply();
					}
					if (down) {
						event.preventDefault();
						$scope.selected = ($scope.selected === $scope.users.length - 1)
							? 0
							: $scope.selected + 1;
						$scope.$apply();
					}

					if (enter) {
						event.preventDefault();
						selectUser($scope.users[$scope.selected]);
					}

					if (punctuation) {
						selectUser($scope.users[$scope.selected], '');
					}
				}
			}

			element.bind('keyup', _.throttle(keyup, 100));
		}
	};
});
