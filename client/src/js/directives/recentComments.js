angular.module('gokibitz.directives')
	.directive('recentComments',
    function () {
			return {
				scope: {
					username: '@',
					noCommenterLink: '@'
				},
				templateUrl: '/partials/directives/recent-comments',
				replace: true,
				controller: 'RecentCommentsCtrl',
				controllerAs: 'ctrl'
			};
    }
  )
	.controller('RecentCommentsCtrl',
		function ($scope, $http, $filter, $sce) {
			var moment = require('moment');
			var since;

			$scope.isString = function (something) {
				return typeof something === 'string';
			};

			// Update the timestamps on the comments
			var refreshTimes = function () {
				$scope.comments.forEach(function (comment, i) {
					var relativeDate = moment(comment.date).fromNow();
					if (comment.relativeDate !== relativeDate) {
						$scope.comments[i].relativeDate = relativeDate;
					}
				});
			};

			var params = {
				// Bundle successive comments by the same user on the same kifu into
				// single chunks
				chunk: true
			};

			if ($scope.username) {
				params.username = $scope.username;
			}

			// Turn an array of paths into HTML. Since we're using filters (a
			// performance bottleneck in ng-repeat), and this goes inside another
			// ng-repeat, and angular ng-ifs don't really work great for adding
			// commas and ands to the right place anyway, we're doing this old
			// school.
			function serializeMoves(comments) {
				comments.forEach(function (comment, i) {
					if (Array.isArray(comment.path)) {
						var pathString = 'moves ';
						comment.path.forEach(function (move, j) {
							var pathArr = [
								'<a href="/kifu/',
								comment.kifu.shortid,
								'?path=',
								$filter('path')(move.path, 'string'),
								'">',
								$filter('verboseNumbers')(move.path)
							];

							var first = (j === 0);
							var last = (j === comment.path.length - 1);
							var penultimate = (j === comment.path.length - 2);

							if (!last && first && penultimate) {
								pathArr.push('</a> and ');
							} else if (!last && !first && penultimate) {
								pathArr.push(',</a> and ');
							} else if (!last && !penultimate) {
								pathArr.push(',</a> ');
							}

							pathString += pathArr.join('');
							comments[i].pathString = $sce.trustAsHtml(pathString);
						});
					}
				});

				return comments;
			}

			$http.get('/api/comment', { params: params })
				.then(function (response) {
					$scope.comments = serializeMoves(response.data);
					since = new Date();
				});

			var commentPoll = setInterval(function () {

				refreshTimes();

				params.since = since;
				$http.get('/api/comment', { params:  params })
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
      }, 10000);

			$scope.$on('$destroy', function () {
				clearInterval(commentPoll);
			});
		}
  );
