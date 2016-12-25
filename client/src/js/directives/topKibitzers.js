angular.module('gokibitz.directives')
	.directive('topKibitzers',
		function () {
			return {
				templateUrl: '/partials/directives/top-kibitzers',
				replace: true,
				controller: 'TopKibitzersCtrl',
				controllerAs: 'ctrl'
			};
		}
	)
	.controller('TopKibitzersCtrl',
		function ($scope, $http, $sce) {
			$http.get('/api/list/most-stars')
				.then(function (response) {
					console.log('response', response);
					$scope.topKibitzers = response.data;
				});
		}
	);
