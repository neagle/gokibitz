angular.module('gokibitz.controllers')
.controller('PasswordController', function ($rootScope, $scope, $modalInstance, Auth, $location, locker) {
	console.log('password controller');
	$scope.changePassword = function (form) {
		//console.log('register function', form, $scope.user);
		Auth.changePassword(
			$scope.user.email,
			$scope.user.oldPassword,
			$scope.user.password,
			function (err) {
				$scope.errors = {};

				if (!err) {
					console.log('SUCCESS');
					//$modalInstance.close();
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
		$modalInstance.dismiss('cancel');
	};
});
