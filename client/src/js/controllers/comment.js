var _ = require('lodash');

angular.module('gokibitz.controllers')
	.controller('CommentController',
		function (
			$rootScope,
			$scope,
			$http,
			$routeParams,
			Comment,
			pathFilter,
			$timeout,
			$interval,
			$q,
			$location,
			$document,
			$sce,
			$compile,
			socket
		) {

			// Handle live updates to comments
			socket.on('send:' + $scope.kifu._id, function (data) {
				var pathString = pathFilter($scope.kifu.path, 'string');

				if (data.comment && data.comment.path === pathString) {
					var index = function () {
						return _.findIndex($scope.comments, function (n) {
							return n._id === data.comment._id;
						});
					};

					switch (data.change) {
						case 'new':
							$scope.comments.push(data.comment);
							$scope.updateUniqComments();
							break;
						case 'update':
							$scope.comments[index()] = data.comment;
							break;
						case 'star':
							$scope.comments[index()].stars = data.comment.stars;
							break;
						case 'unstar':
							$scope.comments[index()].stars = data.comment.stars;
							break;
						case 'delete':
							$scope.comments = _.filter($scope.comments, function (n) {
								return n._id !== data.comment._id;
							});
							$scope.updateUniqComments();
							break;
					}
				}
			});

			$scope.formData = {};
			$scope.commentPreview = '';
			$scope.highlightedComment = $location.search().comment;

			var canceler;

			$scope.listComments = function (alreadyRendered) {
				var path;

				// Turn off animation
				$scope.loading = true;

				if (!alreadyRendered) {
					// Clear existing comments
					$scope.displayComments = [];
					$scope.comments = [];
					$scope.numComments = null;
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
					.then(function (response) {
						var data = response.data;

						if (!alreadyRendered) {
							//Clear existing comments
							$scope.comments = [];
							$scope.numComments = null;
						}

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
							$scope.comments = data;
							$scope.displayComments = [];
							$scope.addMoreComments();

							$scope.loading = false;
						} else {
							$scope.loading = false;
							$scope.comments = data;
							$scope.displayComments = $scope.comments;
						}

					}, function (data) {
						$scope.comments = [];
						console.log('Error: ' + data);
					});
			};

			$scope.addMoreComments = function (num) {
				if (!$scope.comments) {
					return;
				}

				if (!$scope.displayComments) {
					$scope.displayComments = [];
				}

				var position = ($scope.displayComments) ? $scope.displayComments.length : 0;
				num = num || 10;

				if ($scope.comments.length > position) {
					$scope.displayComments = $scope.displayComments.concat($scope.comments.slice(position, position + num));
				}
			};

			$scope.addComment = function () {
				$scope.disableAddComment = true;

				var data = $scope.formData;
				data._id = $scope.kifu._id;
				data.path = pathFilter($scope.kifu.path, 'string');

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

				if (comment.content.markdown === '') {
					$scope.deleteComment(comment);
				} else {
					$http.put('/api/comment/' + comment._id, comment)
						.then(function (response) {
							$scope.disableUpdateComment = false;
							angular.extend(comment, response.data.comment);
							delete self.edit;
						}, function (response) {
							$scope.disableUpdateComment = false;
							console.log('Error: ' + response);
						});
				}
			};

			$scope.cancelEdit = function (comment) {
				var self = this;
				$http.get('/api/comment/' + comment._id)
					.then(function (response) {
						angular.extend(comment, response.data);
						delete self.edit;
					}, function (data) {
						console.log('Error: ' + data);
					});
			};


			$scope.deleteComment = function (comment) {
				$http.delete('/api/comment/' + comment._id)
					.then(function () {
						$scope.listComments(true);
					}, function (data) {
						console.log('Error: ' + data);
					});

			};

			$scope.toggleStar = function (comment) {
				var userId = $scope.currentUser._id;
				var index = comment.stars.indexOf(userId);

				if (index === -1) {
					$http.patch('/api/comment/' + comment._id + '/star')
						.then(function () {
							comment.stars.push($scope.currentUser._id);
							comment.starredByMe = true;
						}, function (data) {
							console.log('Error: ' + data);
						});
				} else {
					$http.patch('/api/comment/' + comment._id + '/unstar')
						.then(function () {
							comment.stars.splice(index, 1);
							comment.starredByMe = false;
						}, function (data) {
							console.log('Error: ' + data);
						});
				}
			};

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
				socket.removeListener('send:' + $scope.kifu._id);
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

			// TODO: This function obviously belongs some place universal.
			function humanCoordinates(move) {
				// Note the missing i
				var letters = 'abcdefghjklmnopqrst';

				var x = letters.substring(move.x, move.x + 1).toUpperCase();
				var y = $scope.player.kifuReader.game.size - move.y;
				return x + y;
			}

			function translateMovesToCoordinates(event) {
				var move;
				if (event.change.add && event.change.add.length) {
					move = event.change.add[0];

					if (!$scope.player.gkVariationArr.length) {
						var str = (move.c === 1) ? 'b' : 'w';
						str += humanCoordinates(move);
						$scope.player.gkVariationArr.push(str);
					} else {
						$scope.player.gkVariationArr.push(humanCoordinates(move));
					}
				} else if (event.change.remove && event.change.remove.length) {
					$scope.player.gkVariationArr.pop();
				}
			}

			// Wait for the player object to become available, since it's not
			// initialized till domready
			$scope.$watch('scope.player', function () {
				$scope.player.addEventListener('update', function (event) {
					if ($scope.variationMode) {
						if (typeof $scope.originalComment === 'undefined') {
							if (typeof $scope.formData.content !== 'undefined') {
								// If there's content in the comment box, preserve it
								$scope.originalComment = $scope.formData.content;
							} else {
								$scope.originalComment = '';
							}
						}

						translateMovesToCoordinates(event);
						$scope.formData = $scope.formData || {};
						$scope.formData.content = $scope.formData.content || '';

						if ($scope.player.gkVariationArr) {
							$scope.formData.content = $scope.originalComment + ' ' + $scope.player.gkVariationArr.join(' ');
						}
					}
				});
			});

			$scope.variationKeyListener = function (event) {
				switch (event.keyCode) {
					// Enter
					case 13:
						$scope.endVariationMode(event, true);
						break;
					// Escape
					case 27:
						$scope.endVariationMode(event, false);
						break;
					default:
						return true;
				}
				return false;
			};

			// Variation mode lets users add variations to their comments by interacting with the board
			$scope.toggleVariationMode = function (startingColor) {
				$scope.toggleKifuVarMode();
				var lastMove = $scope.player.kifuReader.node.move;

				if ($scope.variationMode) {
					$scope.player.gkVariationArr = [];
					$document[0].addEventListener('keyup', $scope.variationKeyListener);
				} else {
					$document[0].removeEventListener('keyup', $scope.variationKeyListener);

					// Trigger the mouseout behavior that removes any markers
					$scope._editable._ev_out();
				}

				if ($scope.player.oneBack) {
					$scope.player.next();
					$scope.player.oneBack = false;
				}
				if (lastMove && lastMove.c === startingColor) {
					$scope.player.oneBack = true;
					$scope.player.previous();
				}
			};

			$scope.endVariationMode = function ($event, add) {
				$event.preventDefault();

				if (add) {
					if ($scope.player.gkVariationArr.length) {
						$scope.formData.content = $scope.originalComment + ' ' + $scope.player.gkVariationArr.join(' ');
					}
				} else if (typeof $scope.originalComment !== 'undefined') {
					$scope.formData.content = $scope.originalComment;
				}

				$scope.originalComment = undefined;

				if ($scope.variationMode) {
					$scope.toggleVariationMode();
				}
			};

		}
	);
