angular.module('gokibitz.controllers')
	.controller('ResetPasswordController', function (
		$rootScope,
		$scope,
		$route,
		$uibModalInstance,
		Auth,
		$location,
		LoginSignup
	) {
		$scope.user = {};

		const username = $route.current.params.username;
		const token = $route.current.params.token;

		$scope.login = function () {
			$uibModalInstance.dismiss('cancel');
			LoginSignup.loginModal();
		};

		$scope.resetPassword = function (form) {
			Auth.resetPassword(username, token, $scope.user.newPassword,
				function (result) {
					if (result.status === 500) {
						$scope.error = result.data;
					}

					if (result.status === 200) {
						$scope.success = true;
					}
				});
		};

		$scope.cancel = function () {
			$uibModalInstance.dismiss('cancel');
			$location.path('/');
		};
	});
