angular.module('gokibitz.controllers')
	.controller('LoginController', function ($rootScope, $scope, $modalInstance, Auth, $location, $localStorage) {
		$scope.$storage = $localStorage;
		$scope.error = {};
		$scope.user = {
			email: $scope.$storage.email || ''
		};

		$scope.login = function (form) {
			Auth.login('password', {
				'email': $scope.user.email,
				'password': $scope.user.password
			},
			function (err) {
				$scope.errors = {};

				if (!err) {
					$scope.$storage.email = $scope.user.email;
					$modalInstance.close($scope.user);
				} else {
					angular.forEach(err.errors, function (error, field) {
						form[field].$setValidity('mongoose', false);
						$scope.errors[field] = error.message;
					});
					$scope.error.other = err.message;
				}
			});

		};

		$scope.cancel = function (callback) {
			$modalInstance.dismiss('cancel');

			if (typeof callback === 'function') {
				callback();
			}
		};
	});
