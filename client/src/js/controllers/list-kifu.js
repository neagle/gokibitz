angular.module('gokibitz.controllers')
	.controller('ListKifuController', function ($rootScope, $scope, $http, $location, settings) {
		$scope.$settings = settings || {};

		$rootScope.pageTitle = 'Kifu – GoKibitz';
		$scope.index = 0;
		$scope.kifu = [];

		if (!$scope.$settings.listKifuToggle && $scope.currentUser) {
			$scope.$settings.listKifuToggle = ($scope.currentUser) ? 'owned' : 'public';
			$scope.$settings.$update();
		}

		$scope.listKifu = function (replace) {
			if (typeof replace === 'undefined') {
				replace = false;
			}

			var url;

			if ($scope.$settings.listKifuToggle === 'owned' && $scope.currentUser) {
				url = '/api/user/' + $scope.currentUser.username + '/kifu';
			} else {
				url = '/api/kifu';
			}

			var params = {
				offset: $scope.index
			};

			if ($scope.search) {
				params.search = $scope.search;
			}

			$http.get(url, {
				params: params
			})
				.success(function (data) {
					$scope.noKifu = false;

					if (!replace) {
						$scope.kifu = $scope.kifu.concat(data.kifu);
					} else {
						$scope.kifu = data.kifu;
					}
					$scope.total = data.total;
					//$scope.comments = data.comments;
				})
				.error(function (data) {
					console.log('Error:', data);
					$scope.noKifu = true;
					if (replace) {
						$scope.kifu = {};
					}
				});
		};

		$scope.moreKifu = function () {
			$scope.index += $scope.kifu.length;
			$scope.listKifu(false);
		};

		var searchTimeout;
		$scope.searchKifu = function () {
			$scope.index = 0;

			if ($scope.searched !== $scope.search) {
				$scope.searched = $scope.search;
				clearTimeout(searchTimeout);
				searchTimeout = setTimeout(function () {
					$scope.listKifu(true);
				}, 200);
			}
			//if ($scope.search && $scope.search.length > 2) {
			//}
		};

		$scope.deleteKifu = function (kifu) {
			$http.delete('/api/kifu/' + kifu._id)
				.success(function (data) {
					for (var i = $scope.kifu.length - 1; i >= 0; i -= 1) {
						var item = $scope.kifu[i];
						if (item._id === kifu._id) {
							$scope.kifu.splice(i, 1);
						}
					}
				})
				.error(function (data) {
					console.log('Error:', data);
				});

		};

		$scope.go = function (shortid) {
			$location.path('/kifu/' + shortid);
		};

		$scope.$watch('$settings.listKifuToggle', function (newValue, oldValue) {
			$scope.listKifu(true);

			if (newValue !== oldValue) {
				$scope.$settings.$update();
			}
		});
	});
