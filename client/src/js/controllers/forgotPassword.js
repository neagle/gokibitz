angular.module('gokibitz.controllers')
	.controller('ForgotPasswordController', function (
		$rootScope,
		$scope,
		$route,
		$modalInstance,
		Auth,
		$location,
		locker,
		LoginSignup
	) {
		$scope.user = {
			email: locker.get('email') || ''
		};

		$scope.requestPasswordReset = function (form) {
			Auth.requestPasswordReset($scope.user.email, result => {
				console.log('result', result);
				if (~[500, 404].indexOf(result.status)) {
					$scope.error = result.data;
				}

				if (result.status === 200) {
					$scope.success = true;
				}
			});
		};

		$scope.cancel = function () {
			$modalInstance.dismiss('cancel');
			$location.path('/');
		};
	});
