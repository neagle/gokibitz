angular.module('gokibitz.controllers')
	.controller('CommentController',
		function ($rootScope, $scope, $http, $routeParams, Comment, pathFilter, $timeout) {
			$scope.formData = {};

			var addCommentsTimer;

			$scope.listComments = function () {
				var path;

				// Turn off animation
				$scope.loading = true;

				// Clear existing comments
				$scope.comments = [];
				$scope.numComments = null;

				// Cancel the addCommentsTimer, in case it's still running
				// on a particularly long set of comments
				if (addCommentsTimer) {
					$timeout.cancel(addCommentsTimer);
				}

				if ($scope.kifu.path.m === 0) {
					path = '';
				} else {
					path = pathFilter($scope.kifu.path, 'string');
				}
				//console.log('path', path);

				$http.get('/api/kifu/' +
					$scope.kifu._id + '/comments/' + path
				)
					.success(function (data) {
						data.forEach(function (comment) {
							comment.pathObject = pathFilter(comment.path, 'object');
						});

						// Use this value instead of $scope.comments.length in the template
						$scope.numComments = data.length;

						// Avoid causing massive delays in rendering with long lists
						// by rendering the first 10, then progressively rendering rest
						// It'd be great, obviously, to figure out how to get ng-repeat
						// to be more performant, but to be fair to it, the DOM for these
						// items is relatively complicated.

						// Add an initial chunk of comments
						$scope.comments = $scope.comments.concat(data.splice(0, 10));

						// ...then add the rest iteratively
						var delay = 50;
						var rate = 1;
						function addCommentsToScope(data) {
							$scope.comments = $scope.comments.concat(data.splice(0, rate));

							if (data.length) {
								addCommentsTimer = $timeout(function () {
									// Recurse!
									addCommentsToScope(data);
								}, delay);
							} else {
								$timeout(function () {
									$scope.loading = false;
								}, 0);
							}
						}

						addCommentsToScope(data);

					})
					.error(function (data) {
						console.log('Error: ' + data);
					});
			};

			$scope.addComment = function () {
				var data = $scope.formData;
				data._id = $scope.kifu._id;
				data.path = pathFilter($scope.kifu.path, 'string');
				//console.log('checking data', data);

				var newComment = new Comment(data);
				newComment.$save(function (response) {
					$scope.formData = {};
					$scope.listComments();
				});
			};

			$scope.updateComment = function (comment) {
				var self = this;

				$http.put('/api/comment/' + comment._id, comment)
					.success(function (data) {
						angular.extend(comment, data.comment);
						delete self.edit;
					})
					.error(function (data) {
						console.log('Error: ' + data);
					});
			};

			$scope.cancelEdit = function (comment) {
				var self = this;
				$http.get('/api/comment/' + comment._id)
					.success(function (data) {
						angular.extend(comment, data);
						delete self.edit;
					})
					.error(function (data) {
						console.log('Error: ' + data);
					});
			};


			$scope.deleteComment = function (comment) {
				$http.delete('/api/comment/' + comment._id)
					.success(function () {
						$scope.listComments();
					})
					.error(function (data) {
						console.log('Error: ' + data);
					});

			};

			// Load Comments
			//$scope.loading = true;
			//$scope.listComments();

			// Poll Comments
			//var pollComments = setInterval(function () {
			//	$scope.listComments();
			//}, 3000);

			$scope.$on('$routeChangeStart', function (next, current) {
				clearInterval(pollComments);
			});

			$scope.$on('$destroy', function () {
				clearInterval(pollComments);
			});

			$scope.$watch('kifu.path', function () {
				$scope.listComments();

				// Resize the iframe
				//console.log('resize from comments controller');
				//resize();
			}, true);
		}
	);
