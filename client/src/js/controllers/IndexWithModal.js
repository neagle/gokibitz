// Go to the index, but pop open a modal
angular.module('gokibitz.controllers')
	.controller('IndexWithModalController', function ($rootScope, $scope, $http, $route, LoginSignup, modal) {
		$rootScope.pageTitle = 'GoKibitz: Move-by-move conversations about go games.';
		$scope.LoginSignup = LoginSignup;

		switch (modal) {
			case 'login':
				LoginSignup.loginModal();
				break;
			case 'resetPassword':
				LoginSignup.resetPasswordModal();
				break;
			default:
				// nowhere to go
		}
	});
