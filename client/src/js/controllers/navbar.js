angular.module('gokibitz.controllers')
.controller('NavbarController', function ($scope, Auth, $location) {
	$scope.menu = [{
		'title': 'Kifu',
		'link': 'kifu'
	}];

	$scope.authMenu = [{
		'title': 'Upload',
		'link': 'upload'
	}];

	$scope.logout = function() {
		Auth.logout(function(err) {
			if(!err) {
				$location.path('/login');
			}
		});
	};
});
