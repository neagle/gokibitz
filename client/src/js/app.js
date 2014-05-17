console.log('Hello, World!');

var angular = require('angular');

var myApp = angular.module('myApp', []);

myApp.controller('MyCtrl', ['$scope', function ($scope) {
	console.log('my ctrl');
	$scope.name = 'Superhero';
}]);
