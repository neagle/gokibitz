angular.module('gokibitz.controllers')
	.controller('NotificationsController',
    function ($scope, $routeParams, $http, $localStorage) {
			$scope.$storage = $localStorage;
			if (typeof $scope.$storage.onlyUnread === 'undefined') {
				$scope.$storage.onlyUnread = false;
			}
    }
);
