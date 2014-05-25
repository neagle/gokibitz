angular.module('gokibitz.services')
	.factory('Session', function ($resource) {
		return $resource('/auth/session/');
	});
