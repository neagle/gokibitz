angular.module('gokibitz.controllers')
	.controller('FetchController',
		function ($scope, $http, $location) {
			$scope.public = true;
			$scope.sgfUrl = $location.hash();

			$scope.fetchSgf = function () {
				$scope.success = null;
				$scope.error = null;

				$scope.uploading = true;
				$http.post('/api/kifu/upload', {
					url: $scope.sgfUrl,
					public: $scope.public
				}).then(function (response) {
					$scope.success = response.data;
					$scope.uploading = false;
					// Reset the URL input
					$scope.sgfUrl = '';
				}, function (error) {
					$scope.error = error;
					$scope.uploading = false;
				});
			};
		}
	);
