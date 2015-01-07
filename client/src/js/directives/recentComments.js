angular.module('gokibitz.directives')
	.directive('recentComments',
    function () {
			return {
				scope: true,
				templateUrl: '/partials/directives/recent-comments',
				replace: true,
				controller: 'RecentCommentsCtrl',
				controllerAs: 'ctrl'
			};
    }
  )
	.controller('RecentCommentsCtrl',
		function ($scope, $http) {
			var since;

			$http.get('/api/comment')
				.then(function (response) {
					$scope.comments = response.data;
					since = new Date();
				});

			var commentPoll = setInterval(function () {
				$http.get('/api/comment', {
					params: { since: since }
				})
					.then(function (response) {
						var newComments = response.data;
						if (newComments.length) {
							// Remove the number of new comments from the end
							$scope.comments.splice($scope.comments.length - newComments.length, newComments.length);

							// Add the new comments to the beginning
							$scope.comments = newComments.concat($scope.comments);
						}
						since = new Date();
					});
      }, 3000);

			$scope.$on('$destroy', function () {
				clearInterval(commentPoll);
			});
		}
  );
