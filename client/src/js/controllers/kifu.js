angular.module('gokibitz.controllers')
	.controller('KifuController', [
		'$scope',
		'$http',
		'$routeParams',
		function ($scope, $http, $routeParams) {
			console.log('kifu control', $routeParams);
			$http.get('/api/kifu/' + $routeParams.shortid)
				.success(function (data) {
					console.log('data', data);
					$scope.kifu = data;
				})
				.error(function (data) {
					console.log('Error:', data);
				});
		}
	]);
