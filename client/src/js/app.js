var bulk = require('bulk-require');
var angular = require('angular');

var gokibitz = angular.module('gokibitz', [
	'gokibitz.controllers',
	'gokibitz.services',
	'ui.bootstrap',
	'ngRoute'
]);

require('./lib/ui-bootstrap-tpls-0.9.0.js'); // UI Bootstrap
require('angular-route');


// Constants
gokibitz
	.constant('AUTH_EVENTS', {
		loginSuccess: 'auth-login-success',
		loginFailed: 'auth-login-failed',
		logoutSuccess: 'auth-logout-success',
		sessionTimeout: 'auth-session-timeout',
		notAuthenticated: 'auth-not-authenticated',
		notAuthorized: 'auth-not-authorized'
	})
	.constant('USER_ROLES', {
		all: '*',
		admin: 'admin',
		user: 'user',
		guest: 'guest'
	});

// Controllers
angular.module('gokibitz.controllers', []);
bulk(__dirname, ['./controllers/**/*.js']);

// Services
angular.module('gokibitz.services', []);
bulk(__dirname, ['./services/**/*.js']);

gokibitz.config([
	'$routeProvider',
	'$locationProvider',
	'USER_ROLES',
	function ($routeProvider, $locationProvider, USER_ROLES) {
		console.log('routes!');
		$routeProvider
			.when('/', {
				templateUrl: 'partials/index',
				controller: 'IndexController'
			})
			.when('/login', {
				templateUrl: 'partials/login',
				controller: 'LoginController'
			})
			.when('/signup', {
				templateUrl: 'partials/signup',
				controller: 'SignupController'
			})
			.when('/profile', {
				templateUrl: 'partials/profile',
				controller: 'ProfileController',
				data: {
					authorizedRoles: [
						USER_ROLES.admin,
						USER_ROLES.user
					]
				}
			})
			.when('/admin', {
				templateUrl: 'partials/profile',
				controller: 'ProfileController',
				data: {
					authorizedRoles: [
						USER_ROLES.admin
					]
				}
			})
			.when('/upload', {
				templateUrl: 'partials/upload',
				controller: 'UploadController',
				data: {
					authorizedRoles: [
						USER_ROLES.admin,
						USER_ROLES.user
					]
				}
			})
			.when('/kifu', {
				templateUrl: 'partials/kifu',
				controller: 'KifuController',
				data: {
					authorizedRoles: [
						USER_ROLES.admin,
						USER_ROLES.user
					]
				}
			})
			.otherwise({
				redirectTo: '/'
			});

		$locationProvider.html5Mode(true);
	}
]);

gokibitz.config([
	'$httpProvider',
	function ($httpProvider) {
		$httpProvider.interceptors.push([
			'$injector',
			function ($injector) {
				return $injector.get('AuthInterceptor');
			}
		]);
	}
]);

gokibitz.run([
	'$rootScope',
	'AUTH_EVENTS',
	'AuthService',
	function ($rootScope, AUTH_EVENTS, AuthService) {
		$rootScope.$on('$locationChangeStart', function (event, next) {
			var authorizedRoles = next.data.authorizedRoles;
			if (!AuthService.isAuthorized(authorizedRoles)) {
				event.preventDefault();
				if (AuthService.isAuthenticated()) {
					if (AuthService.isAuthenticated()) {
						// user is not allowed
						$rootScope.$broadcast(AUTH_EVENTS.notAuthenticated);
					}
				} else {
					// user is not logged in
					$rootScope.$broadcast(AUTH_EVENTS.notAuthenticated);
				}
			}
		});
	}
]);
