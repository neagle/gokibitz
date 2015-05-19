angular.module('gokibitz.directives')
	.directive('notifications',
	function () {
		return {
			restrict: 'E',
			scope: {
				username: '=?',
				limit: '@',
				//unread: '@',
				count: '=?',
				unreadCount: '=?',
				unseenCount: '=?',
				mostRecent: '=?',
				lastSeen: '=?',
				ctrl: '=?'
			},
			templateUrl: '/partials/directives/notifications',
			replace: true,
			controller: 'NotificationsCtrl',
			controllerAs: 'ctrl',
			bindToController: true
		};
	}
)
	.controller('NotificationsCtrl',
		function ($scope, $http, $location) {
			var ctrl = this;
			var since;

			ctrl.getNotifications = function () {
				var params = {};

				if (ctrl.username) {
					params.username = ctrl.username;
				}

				if (ctrl.limit) {
					params.limit = Number(ctrl.limit);
				}

				$http.get('/api/notification/', { params: params })
					.then(function (response) {
						ctrl.notifications = response.data;
						if (ctrl.notifications) {
							ctrl.count = ctrl.notifications.length;
						} else {
							ctrl.count = 0;
						}

						ctrl.countNotifications();
						since = new Date();

						if (ctrl.notifications && ctrl.notifications.length) {
							ctrl.mostRecent = ctrl.notifications[0];
						}
					});
			};

			ctrl.countNotifications = function () {
				if (ctrl.notifications && ctrl.notifications.length) {
					var unread = 0;
					var unseen = 0;

					for (var i = 0; i < ctrl.notifications.length; i += 1) {
						if (!ctrl.notifications[i].read) {
							unread += 1;
						}
						if (!ctrl.lastSeen || ctrl.notifications[i].date > ctrl.lastSeen.date) {
							unseen += 1;
						}
					}

					ctrl.unreadCount = unread;
					ctrl.unseenCount = unseen;
				}
			};

			ctrl.clickNotification = function ($event, notification) {
				notification.read = true;
				ctrl.countNotifications();
				$http.get('/api/notification/read/' + notification._id)
					.then(function (response) {
						$location.path('/kifu/' + notification.kifu.shortid).search({
							path: notification.path,
							comment: notification.comment._id
						});
					});
				$event.preventDefault();
			};

			ctrl.getNotifications();

			// TODO: switch to websockets
			var notificationsPoll = setInterval(ctrl.getNotifications, 10000);

			$scope.$watch('ctrl.lastSeen', ctrl.countNotifications);

			$scope.$on('$destroy', function () {
				clearInterval(notificationsPoll);
			});
		}
	);
