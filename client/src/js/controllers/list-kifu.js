angular.module('gokibitz.controllers')
	.controller('ListKifuController', ['$scope', '$http', function ($scope, $http) {
		console.log('list kifu control');
		$scope.listKifu = function () {
			$http.get('/api/user/' + $scope.currentUser.username + '/kifu')
				.success(function (data) {
					$scope.kifu = data;
				})
				.error(function (data) {
					console.log('Error:', data);
				});
		};

		$scope.listKifu();
	}]);
