angular.module('gokibitz.controllers')
.controller('PasswordController', function ($rootScope, $scope, $uibModalInstance, Auth, $location, locker) {
	console.log('password controller');
	$scope.changePassword = function (form) {
		Auth.changePassword(
			$scope.user.email,
			$scope.user.oldPassword,
			$scope.user.password,
			function (err) {
				$scope.errors = {};

				if (!err) {
					$uibModalInstance.close();
				} else {
					angular.forEach(err.errors, function (error, field) {
						form[field].$setValidity('mongoose', false);
						$scope.errors[field] = error.message;
					});
				}
			}
		);
	};

	$scope.cancel = function () {
		$uibModalInstance.dismiss('cancel');
	};
});
