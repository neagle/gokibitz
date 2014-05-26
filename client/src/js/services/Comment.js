angular.module('gokibitz.services')
	.factory('Comment', function ($resource) {
		return $resource('/api/comment/:id', {}, {
			'update': {
				method: 'PUT'
			}
		});
	});
