angular.module('gokibitz.services')
.factory('User', function ($resource) {
	return $resource('/auth/users/:id/', {}, {
		'update': {
			 method: 'PUT'
		}
	});
});
