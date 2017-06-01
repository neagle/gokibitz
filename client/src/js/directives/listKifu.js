angular.module('gokibitz.directives')
	.directive('listKifu',
		function () {
			return {
				scope: {
					username: '@',
					public: '@'
				},
				templateUrl: '/partials/directives/list-kifu',
				replace: true,
				controller: 'ListKifuCtrl',
				controllerAs: 'ctrl'
			};
		}
	)
	.controller('ListKifuCtrl',
		function ($scope, $http, $filter, $sce) {
			$scope.index = 0;
			$scope.kifu = [];

			$scope.listKifu = function (replace) {
				console.log('listKifu')
				if (typeof replace === 'undefined') {
					replace = false;
				}

				var params = {
					offset: $scope.index,
					public: typeof $scope.public === 'undefined' ? true : $scope.public
				};

				console.log('params', params)

				let url;
				if ($scope.username) {
					url = '/api/user/' + $scope.username + '/kifu';
				} else {
					url = '/api/kifu';
				}

				$http.get(url, { params: params })
					.then(function (response) {
						console.log('response', response)
						const data = response.data;
						if (!replace) {
							$scope.kifu = $scope.kifu.concat(data.kifu);
						} else {
							$scope.kifu = data.kifu;
						}
						$scope.total = data.total;
					});
			}

			$scope.moreKifu = function () {
				$scope.index += $scope.kifu.length;
				$scope.listKifu(false);
			};

			$scope.listKifu(true);
		}
  );
