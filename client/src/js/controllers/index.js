angular.module('gokibitz.controllers')
	.controller('IndexController', function ($rootScope, $scope, $http, LoginSignup) {
		console.log('+index control', LoginSignup);
		$scope.LoginSignup = LoginSignup;
	});
