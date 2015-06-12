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

			signupModal: function () {
				$modal.open({
					templateUrl: '/partials/signup',
					controller: 'SignupController'
				});
			}
		};
	});
