var bulk = require('bulk-require');
var angular = require('angular');

var gokibitz = angular.module('gokibitz', [
	'gokibitz.controllers',
	'ui.bootstrap',
	'ngRoute'
]);

console.log('initialize the module', gokibitz);

require('./lib/ui-bootstrap-tpls-0.9.0.js'); // UI Bootstrap
require('angular-route');

angular.module('gokibitz.controllers', []);
bulk(__dirname, ['./controllers/**/*.js']);

gokibitz.config([
	'$routeProvider',
	'$locationProvider',
	function ($routeProvider, $locationProvider) {
		$routeProvider
			.when('/profile', {
				templateUrl: 'partials/profile',
				controller: 'ProfileController'
			})
			.when('/upload', {
				templateUrl: 'partials/upload',
				controller: 'UploadController'
			})
			.otherwise({
				redirectTo: '/'
			});

		$locationProvider.html5Mode(true);
	}
]);
