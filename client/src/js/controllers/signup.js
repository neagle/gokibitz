angular.module('gokibitz.controllers')
.controller('SignupController', function ($rootScope, $scope, $modalInstance, Auth, $location) {
	$scope.register = function (form) {
		console.log('register function');
		Auth.createUser({
			email: $scope.user.email,
			username: $scope.user.username,
			password: $scope.user.password
		},
		function (err) {
			$scope.errors = {};

			if (!err) {
				$location.path('/');
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
