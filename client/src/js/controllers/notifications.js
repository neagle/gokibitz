angular.module('gokibitz.controllers')
	.controller('NotificationsController',
		function ($scope, $routeParams, $http, locker) {
			if (typeof locker.get('onlyUnread') === 'undefined') {
				locker.put('onlyUnread', false);
			}
		}
);
