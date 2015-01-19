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
//require('./lib/wgo/src/basicplayer.commentbox.js');
require('./lib/wgo/src/basicplayer.control.js');
require('./lib/wgo/src/player.editable.js');
require('./lib/wgo/src/scoremode.js');
require('./lib/wgo/src/player.permalink.js');

var gokibitz = angular.module('gokibitz', [
	'gokibitz.controllers',
	'gokibitz.directives',
	'gokibitz.services',
	'gokibitz.filters',
	'ui.router',
	'ui.bootstrap',
	'ui.bootstrap.tpls',
	'ngCookies',
	'ngResource',
	'ngSanitize',
	'ngRoute',
	'ngAnimate',
	'ngTouch',
	'ngWebSocket',
	'http-auth-interceptor',
	'ui.utils',
	'ngStorage',
	'720kb.socialshare',
	'flatui.directives',
	'duScroll'
]);

require('angular-ui-router');
require('angular-animate');
require('angular-route');
require('angular-cookies');
require('angular-resource');
require('angular-sanitize');
require('angular-touch');
require('angular-websocket');
require('http-auth-interceptor');
require('ui-bootstrap-tpls');
require('ui-bootstrap');
require('ui-utils');
require('ngStorage');
require('angular-scroll');

// Third-party share button directive
// @see https://github.com/720kb/angular-socialshare
require('./lib/angular-socialshare.js');

// @see https://gist.github.com/cirqueit/b668f464a80ad5c8ca0b
require('./lib/flatui.directives.js');

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

gokibitz.config(
	function ($routeProvider, $locationProvider) {
		$routeProvider
			.when('/', {
				templateUrl: '/partials/index',
				controller: 'IndexController',
				resolve: {
					//  Just for old-times sake: we're no longer using a kifu on the homepage
					//kifu: function ($http) {
					//	return $http.get('/api/kifu', {
					//		params: {
					//			limit: 1
					//		}
					//	});
					//}
				}
			})
			.when('/notifications', {
				templateUrl: '/partials/notifications',
				controller: 'NotificationsController'
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
				reloadOnSearch: false,
				resolve: {
					kifu: function ($http, $route) {
						var shortid = $route.current.params.shortid;
						return $http.get('/api/kifu/' + shortid);
          }
				}
			})
			.when('/user/:username', {
				templateUrl: '/partials/user',
				controller: 'UserController',
				resolve: {
					user: function ($http, $route) {
						var username = $route.current.params.username;
						return $http.get('/api/user/' + username);
					}
				}
			})
			.otherwise({
				redirectTo: '/'
			});

		$locationProvider.html5Mode(true);
	}
);

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

gokibitz.run(
	function ($rootScope, $location, Auth, $route, $window) {

		// Check to see if we're in an iframe
		$rootScope.iframed = ($window.self !== $window.top);

		$rootScope.$on('$routeChangeSuccess', function () {
			// Reset the page's title on ever route change
			// Better to the title blank than wrong
			$rootScope.pageTitle = '';
		});

		//watching the value of the currentUser variable.
		$rootScope.$watch('currentUser', function(currentUser) {
			// if no currentUser and on a page that requires authorization then try to update it
			// will trigger 401s if user does not have a valid session
			var path = $location.path().split('/');
			path = '/' +  path[1];

			if (
				!currentUser &&
				!~['/', '/login', '/logout', '/signup', '/kifu', '/user'].indexOf(path)
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
);
