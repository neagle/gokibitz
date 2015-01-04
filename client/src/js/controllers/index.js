angular.module('gokibitz.controllers')
	.controller('IndexController', function ($rootScope, $scope, $http, LoginSignup) {
		$scope.LoginSignup = LoginSignup;
	});
