'use strict';

angular.module('gokibitz.services')
	.factory('LoginSignup', function LoginSignup($modal) {
		return {
			loginModal: function () {
				$modal.open({
					templateUrl: '/partials/login',
					controller: 'LoginController'
				});
			},

			forgotPasswordModal: function () {
				console.log('forgotPasswordModal');
				$modal.open({
					templateUrl: '/partials/forgot-password',
					controller: 'ForgotPasswordController'
				});
			},

			resetPasswordModal: function () {
				$modal.open({
					templateUrl: '/partials/reset-password',
					controller: 'ResetPasswordController'
				});
			},

			signupModal: function () {
				$modal.open({
					templateUrl: '/partials/signup',
					controller: 'SignupController'
				});
			}
		};
	});
