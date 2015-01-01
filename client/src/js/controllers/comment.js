angular.module('gokibitz.controllers')
	.controller('CommentController', [
		'$rootScope',
		'$scope',
		'$http',
		'$routeParams',
		'Comment',
		'pathFilter',
		function ($rootScope, $scope, $http, $routeParams, Comment, pathFilter) {
			//console.log('Comment Controller');
			//console.log('scope', $scope);

			$scope.$watch('kifu', function () {
				//console.log('KIFU', $scope.kifu);
				if ($scope.kifu) {
					$scope.formData = {};

					$scope.listComments = function () {
						//console.log('checking $scope.comments', $scope.comments);
						//console.log('$scope.loading', $scope.loading);
						//console.log('list comments itself, checking path', $scope.kifu.path);
						var path;

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
									comment.path = pathFilter(comment.path, 'object');
								});
								$scope.comments = data;
								setTimeout(function () {
									$scope.loading = false;
								}, 0);
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
					$scope.loading = true;
					$scope.listComments();

					setInterval(function () {
						$scope.listComments();
					}, 3000);

					$scope.$watch('kifu.path', function () {
						$scope.loading = true;
						$scope.comments = null;
						$scope.listComments();

						// Resize the iframe
						//console.log('resize from comments controller');
						//resize();
					}, true);

					$scope.$on('edit', function (event, edit) {
						//console.log('edit has changed', edit);
					});
				}
			});
		}
	]);
