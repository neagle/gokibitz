angular.module('gokibitz.controllers')
	.controller('IndexController', function ($rootScope, $scope, $http, LoginSignup) {
		$rootScope.pageTitle = 'GoKibitz: Move-by-move conversations about go games.';
		$scope.LoginSignup = LoginSignup;
	});
