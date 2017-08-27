angular.module('gokibitz.controllers')
	.controller('LoginController', function ($rootScope, $scope, $uibModalInstance, Auth, $location, locker, LoginSignup) {
		$scope.error = {};
		$scope.user = {
			email: locker.get('email') || ''
		};

		$scope.login = function (form) {
			Auth.login('password', {
				'email': $scope.user.email,
				'password': $scope.user.password
			},
			function (err) {
				$scope.errors = {};

				if (!err) {
					locker.put('email', $scope.user.email);
					let redirect = $rootScope.redirectOnAuth;
					if (redirect) {
						$location.path(redirect);
						delete $rootScope.redirectOnAuth;
					}
					$uibModalInstance.close($scope.user);
				} else {
					angular.forEach(err.errors, function (error, field) {
						form[field].$setValidity('mongoose', false);
						$scope.errors[field] = error.message;
					});
					$scope.error.other = err.message;
				}
			});

		};

		$scope.forgotPassword = function () {
			$uibModalInstance.dismiss('cancel');
			LoginSignup.forgotPasswordModal();
		};

		$scope.cancel = function (callback) {
			$uibModalInstance.dismiss('cancel');

			if (typeof callback === 'function') {
				callback();
			}
		};
	});
