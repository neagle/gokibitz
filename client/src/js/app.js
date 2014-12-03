var bulk = require('bulk-require');
var angular = require('angular');

// WGo
require('./lib/wgo/src/wgo.js');
require('./lib/wgo/src/kifu.js');
require('./lib/wgo/src/sgfparser.js');
require('./lib/wgo/src/player.js');
require('./lib/wgo/src/basicplayer.js');
require('./lib/wgo/src/basicplayer.component.js');
require('./lib/wgo/src/basicplayer.infobox.js');
require('./lib/wgo/src/basicplayer.commentbox.js');
require('./lib/wgo/src/basicplayer.control.js');
require('./lib/wgo/src/player.editable.js');
require('./lib/wgo/src/scoremode.js');
require('./lib/wgo/src/player.permalink.js');

var gokibitz = angular.module('gokibitz', [
	'gokibitz.controllers',
	'gokibitz.directives',
	'gokibitz.services',
	'gokibitz.filters',
	'ui.bootstrap',
	'ui.bootstrap.tpls',
	'ngCookies',
	'ngResource',
	'ngSanitize',
	'ngRoute',
	'ngAnimate',
	'http-auth-interceptor',
	'angularFileUpload',
	'ui.utils'
]);

require('angular-animate');
require('angular-route');
require('angular-file-upload');
require('angular-cookies');
require('angular-resource');
require('angular-sanitize');
require('http-auth-interceptor');
require('ui-bootstrap-tpls');
require('ui-bootstrap');
require('ui-utils');

angular.module('gokibitz.controllers', []);
angular.module('gokibitz.directives', []);
angular.module('gokibitz.services', []);
angular.module('gokibitz.filters', []);
bulk(__dirname, [
	'./controllers/**/*.js',
	'./directives/**/*.js',
	'./services/**/*.js',
	'./filters/**/*.js'
]);

gokibitz.config([
	'$routeProvider',
	'$locationProvider',
	function ($routeProvider, $locationProvider) {
		$routeProvider
			.when('/', {
				templateUrl: '/partials/index',
				controller: 'IndexController'
			})
			//.when('/login', {
				//templateUrl: '/partials/login',
				//controller: 'LoginController'
			//})
			//.when('/signup', {
				//templateUrl: '/partials/signup',
				//controller: 'SignupController'
			//})
			.when('/profile', {
				templateUrl: '/partials/profile',
				controller: 'ProfileController'
			})
			.when('/admin', {
				templateUrl: '/partials/admin',
				controller: 'AdminController'
			})
			.when('/upload', {
				templateUrl: '/partials/upload',
				controller: 'UploadController'
			})
			.when('/kifu', {
				templateUrl: '/partials/list-kifu',
				controller: 'ListKifuController'
			})
			.when('/kifu/:shortid', {
				templateUrl: '/partials/kifu',
				controller: 'KifuController',
				reloadOnSearch: false
			})
			.otherwise({
				redirectTo: '/'
			});

		$locationProvider.html5Mode(true);
	}
]);

//gokibitz.config([
	//'$httpProvider',
	//function ($httpProvider) {
		//$httpProvider.interceptors.push([
			//'$injector',
			//function ($injector) {
				//return $injector.get('AuthInterceptor');
			//}
		//]);
	//}
//]);

gokibitz.run([
	'$rootScope',
	'$location',
	'Auth',
	function ($rootScope, $location, Auth) {
		//watching the value of the currentUser variable.
		$rootScope.$watch('currentUser', function(currentUser) {
			// if no currentUser and on a page that requires authorization then try to update it
			// will trigger 401s if user does not have a valid session
			if (
				!currentUser &&
				!~['/', '/login', '/logout', '/signup', '/kifu'].indexOf($location.path())
			) {
				Auth.currentUser();
			}
		});

		// On catching 401 errors, redirect to the login page.
		$rootScope.$on('event:auth-loginRequired', function () {
			$location.path('/');
			return false;
		});
	}
]);
