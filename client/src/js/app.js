console.log('Hello, World!');

var angular = require('angular');

var myApp = angular.module('myApp', ['ui.bootstrap']);

// UI Bootstrap
require('./lib/ui-bootstrap-tpls-0.9.0.js');

myApp.controller('MyCtrl', ['$scope', function ($scope) {
	console.log('my ctrl');
	$scope.name = 'Superhero';
}]);


myApp.controller('AlertDemoCtrl', ['$scope', function ($scope) {
	$scope.alerts = [
		{ type: 'danger', msg: 'Oh snap! Change a few things up and try submitting again.' },
		{ type: 'success', msg: 'Well done! You successfully read this important alert message.' }
	];

	$scope.addAlert = function() {
		$scope.alerts.push({msg: 'Another alert!'});
	};

	$scope.closeAlert = function(index) {
		$scope.alerts.splice(index, 1);
	};
}]);
