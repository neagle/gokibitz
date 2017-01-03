angular.module('gokibitz.controllers')
	.controller('TopUsersController', function ($rootScope, $scope, $http, $location) {
		console.log('Top Users');
		$rootScope.pageTitle = 'Top Users – GoKibitz';
	});
