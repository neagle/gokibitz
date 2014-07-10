angular.module('gokibitz.controllers')
.controller('SignupController', function ($rootScope, $scope, $modalInstance, Auth, $location) {
	$scope.error = {};
	$scope.user = {};

	$scope.register = function (form) {
		console.log('register function', form, $scope.user);
		Auth.createUser({
			email: $scope.user.email,
			username: $scope.user.username,
			password: $scope.user.password
		},
		function (err) {
			$scope.errors = {};

			if (!err) {
				$rootScope.flash = {
					type: 'success',
					message: 'Welcome to GoKibitz, ' + $scope.currentUser.username + '!'
				};
				$modalInstance.close($scope.user);
			} else {
				angular.forEach(err.errors, function (error, field) {
					form[field].$setValidity('mongoose', false);
					$scope.errors[field] = error.type;
				});
			}
		});
	};

	$scope.cancel = function () {
		$modalInstance.dismiss('cancel');
	};
});
