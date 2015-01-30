angular.module('gokibitz.services')
	// A generic, mixed field on the user object to store arbitrary settings
	.factory('Settings', function ($resource) {
		return $resource('/api/settings', {}, {
			'update': {
				method: 'PUT'
			}
		});
	});
