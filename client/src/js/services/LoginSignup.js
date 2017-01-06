'use strict';

angular.module('gokibitz.services')
	.factory('LoginSignup', function LoginSignup($uibModal) {
		return {
			loginModal: function () {
				$uibModal.open({
					templateUrl: '/partials/login',
					controller: 'LoginController'
				});
			},

			forgotPasswordModal: function () {
				$uibModal.open({
					templateUrl: '/partials/forgot-password',
					controller: 'ForgotPasswordController'
				});
			},

			resetPasswordModal: function () {
				$uibModal.open({
					templateUrl: '/partials/reset-password',
					controller: 'ResetPasswordController'
				});
			},

			signupModal: function () {
				$uibModal.open({
					templateUrl: '/partials/signup',
					controller: 'SignupController'
				});
			}
		};
	});
