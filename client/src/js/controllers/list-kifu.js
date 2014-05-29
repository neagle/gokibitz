angular.module('gokibitz.controllers')
	.controller('ListKifuController', ['$scope', '$http', function ($scope, $http) {
		console.log('list kifu control');
		$scope.listKifu = function () {
			var url;
			if ($scope.currentUser) {
				url = '/api/user/' + $scope.currentUser.username + '/kifu';
			} else {
				url = '/api/kifu';
			}

			$http.get(url)
				.success(function (data) {
					$scope.kifu = data;
				})
				.error(function (data) {
					console.log('Error:', data);
				});
		};

		$scope.listKifu();
	}]);
