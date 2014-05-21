angular.module('gokibitz.controllers')
	.controller('ApplicationController', [
		'$scope',
		'USER_ROLES',
		'AuthService',
		function ($scope, USER_ROLES, AuthService) {
			console.log('application controller');
			$scope.currentUser = null;
			$scope.userRoles = USER_ROLES;
			$scope.isAuthorized = AuthService.isAuthorized;
		}
	]);
