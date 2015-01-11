angular.module('gokibitz.directives')
	.directive('notifications',
	function () {
		return {
			scope: {
				username: '@',
				limit: '@',
				unread: '@',
				count: '=',
				unreadCount: '=',
				unseenCount: '=',
				mostRecent: '=',
				lastSeen: '='
			},
			link: function ($scope, element, attributes) {
				attributes.$observe('unread', function (unread) {
					$scope.unread = unread;
					$scope.$broadcast('unread-toggle');
				});
			},
			templateUrl: '/partials/directives/notifications',
			replace: true,
			controller: 'NotificationsCtrl',
			controllerAs: 'ctrl'
		};
	}
)
	.controller('NotificationsCtrl',
    function ($scope, $http, $location) {
      var username = $scope.username;
      var moment = require('moment');
      var since;

      // Update the timestamps on the comments
      var refreshTimes = function () {
				if ($scope.notifications && $scope.notifications.length) {
					$scope.notifications.forEach(function (notification, i) {
						var relativeDate = moment(notification.date).fromNow();
						if (notification.relativeDate !== relativeDate) {
							$scope.notifications[i].relativeDate = relativeDate;
						}
					});
				}
      };

			function unreadCount(notifications) {
				if (notifications && notifications.length) {
					var unread = 0;
					var unseen = 0;
					for (var i = 0; i < notifications.length; i += 1) {
						if (!notifications[i].read) {
							unread += 1;
						}
						if (!$scope.lastSeen || notifications[i].date > $scope.lastSeen.date) {
							unseen += 1;
						}
					}
					$scope.unreadCount = unread;
					$scope.unseenCount = unseen;
				}

			}

			$scope.$watch('lastSeen', function () {
				unreadCount($scope.notifications);
			});

			$scope.$on('unread-toggle', function () {
				params.unread = ($scope.unread === 'false') ? false : true;
				params.since = null;
				getNotifications();
			});

			$scope.clickNotification = function ($event, notification) {
				notification.read = true;
				unreadCount($scope.notifications);
				$http.get('/api/notification/read/' + notification._id)
					.then(function (response) {
						$location.path('/kifu/' + notification.kifu.shortid).search({ path: notification.path });
					});
				$event.preventDefault();
			};

      var params = {
				unread: ($scope.unread == false) ? false : true
			};

			function getNotifications() {
				$http.get('/api/notification/', { params: params })
					.then(function (response) {
						$scope.notifications = response.data;
						if ($scope.notifications) {
							$scope.count = $scope.notifications.length;
						} else {
							$scope.count = 0;
						}
						unreadCount($scope.notifications);
						since = new Date();
						if ($scope.notifications && $scope.notifications.length) {
							$scope.mostRecent = $scope.notifications[0];
						}
					});
			}

			getNotifications();

			var notificationsPoll = setInterval(getNotifications, 5000);

      //var notificationsPoll = setInterval(function () {
      //
      //  refreshTimes();
      //
      //  params.since = since;
      //  $http.get('/api/notification/', { params:  params })
      //    .then(function (response) {
      //      var newNotifications = response.data;
      //      if (newNotifications.length) {
      //        if ($scope.limit) {
      //          // Remove the number of new comments from the end
      //          $scope.notifications.splice($scope.notifications.length - newNotifications.length, newComments.length);
      //        }
      //
      //        // Add the new comments to the beginning
      //        $scope.notifications = newNotifications.concat($scope.notifications);
      //      }
				//		if ($scope.notifications) {
				//			$scope.count = $scope.notifications.length;
				//		} else {
				//			$scope.count = 0;
				//		}
				//		unreadCount($scope.notifications);
      //      since = new Date();
      //    });
      //}, 3000);

      $scope.$on('$destroy', function () {
        clearInterval(notificationsPoll);
      }
		);
	}
);
