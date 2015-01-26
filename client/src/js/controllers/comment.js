angular.module('gokibitz.controllers')
	.controller('CommentController',
		function ($rootScope, $scope, $http, $routeParams, Comment, pathFilter, $timeout, $interval, $q, $location, $document, $sce, $compile) {
			$scope.formData = {};

			$scope.highlightedComment = $location.search().comment;

			var addCommentsTimer;
			var pollComments;
			var canceler;

			var stop;
			$scope.stopPolling = function () {
				if (angular.isDefined(stop)) {
					$interval.cancel(stop);
					stop = undefined;
				}
			};

			//stop = $interval(function () {
				//if (!$scope.loading) {
					//$scope.listComments(true);
				//}
			//}, 3000);

			$scope.listComments = function (alreadyRendered) {
				var path;

				// Turn off animation
				$scope.loading = true;

				if (!alreadyRendered) {
					// Clear existing comments
					$scope.comments = [];
					$scope.numComments = null;
				}

				// Cancel the addCommentsTimer, in case it's still running
				// on a particularly long set of comments
				if (addCommentsTimer) {
					$timeout.cancel(addCommentsTimer);
				}

				// Cancel any previous listComments calls
				if (canceler) {
					canceler.resolve();
				}

				if ($scope.kifu.path.m === 0) {
					path = '';
				} else {
					path = pathFilter($scope.kifu.path, 'string');
				}

				canceler = $q.defer();
				$http.get('/api/kifu/' + $scope.kifu._id + '/comments/' + path, {
					timeout: canceler.promise
        })
					.success(function (data) {
						var highlightedComment = $location.search().comment;
						var highlightedCommentPresent = false;

						data.forEach(function (comment) {

							// Create a path object {{ m: 0 }} out of the path strings on the comment
							comment.pathObject = pathFilter(comment.path, 'object');

							// Tell Angular that we trust this HTML so that it doesn't sanitize it
							comment.content.html = $sce.trustAsHtml(comment.content.html);

							// Set a flag on comments starred by the current user
							if ($scope.currentUser) {
								comment.starredByMe = (comment.stars.indexOf($scope.currentUser._id) !== -1);
							}

							if (comment._id === highlightedComment) {
								highlightedCommentPresent = true;
							}
						});

						// If the highlighted comment isn't present on this move, remove it from the
						// query string
						if (!highlightedCommentPresent && $scope.highlightedComment) {
							$scope.highlightedComment = null;
							$location.search('comment', null);
						}

						// Use this value instead of $scope.comments.length in the template
						$scope.numComments = data.length;

						if (!alreadyRendered) {
							// Avoid causing massive delays in rendering with long lists
							// by rendering the first 10, then progressively rendering rest
							// It'd be great, obviously, to figure out how to get ng-repeat
							// to be more performant, but to be fair to it, the DOM for these
							// items is relatively complicated.

							// Add an initial chunk of comments
							$scope.comments = $scope.comments.concat(data.splice(0, 10));
							//console.log('$scope.comments', $scope.comments);

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

										if ($scope.highlightedComment) {
											$scope.goToComment($scope.highlightedComment);
										}
									}, 0);
								}
							}

							addCommentsToScope(data);
						} else {
							$scope.loading = false;
							$scope.comments = data;
						}

					})
					.error(function (data) {
						console.log('Error: ' + data);
					});
			};

			$scope.addComment = function () {
				$scope.disableAddComment = true;
				var data = $scope.formData;
				data._id = $scope.kifu._id;
				data.path = pathFilter($scope.kifu.path, 'string');
				//console.log('checking data', data);

				var newComment = new Comment(data);
				newComment.$save(function (response) {
					$scope.disableAddComment = false;
					$scope.formData = {};
					$scope.listComments(true);
				});
			};

			$scope.updateComment = function (comment) {
				$scope.disableUpdateComment = true;
				var self = this;

				$http.put('/api/comment/' + comment._id, comment)
					.success(function (data) {
						$scope.disableUpdateComment = false;
						angular.extend(comment, data.comment);
						delete self.edit;
					})
					.error(function (data) {
						$scope.disableUpdateComment = false;
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
						$scope.listComments(true);
					})
					.error(function (data) {
						console.log('Error: ' + data);
					});

			};

			$scope.toggleStar = function (comment) {
				var userId = $scope.currentUser._id;
				var index = comment.stars.indexOf(userId);

				if (index === -1) {
					$http.patch('/api/comment/' + comment._id + '/star')
						.success(function () {
							comment.stars.push($scope.currentUser._id);
							comment.starredByMe = true;
						})
						.error(function (data) {
							console.log('Error: ' + data);
						});
				} else {
					$http.patch('/api/comment/' + comment._id + '/unstar')
						.success(function () {
							comment.stars.splice(index, 1);
							comment.starredByMe = false;
						})
						.error(function (data) {
							console.log('Error: ' + data);
						});
				}
			}

			$scope.goToComment = function (commentId) {
				var elem = angular.element($document[0].getElementById('comment-' + commentId));
				var navbar = angular.element($document[0].getElementById('gk-navbar'));
				var padding = 20;

				if (elem.length) {
					$document.scrollTo(elem, navbar.outerHeight(true) + padding, 1000);
				}
			};

			$scope.$on('$routeChangeStart', function (next, current) {
				//$scope.stopPolling();
			});

			$scope.$on('$destroy', function () {
				$scope.stopPolling();
			});

			$scope.$watch('kifu.path', function () {
				$scope.listComments();
			}, true);

			$scope.$on('$routeUpdate', function () {
				var comment = $location.search().comment;
				if (comment && comment !== $scope.highlightedComment) {
					$scope.highlightedComment = comment;
					$scope.goToComment(comment);
				}
			});

		}
	);
