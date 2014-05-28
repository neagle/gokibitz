var pathString = require('../helpers/pathString.js');

angular.module('gokibitz.controllers')
	.controller('CommentController', [
		'$rootScope',
		'$scope',
		'$http',
		'$routeParams',
		'Comment',
		function ($rootScope, $scope, $http, $routeParams, Comment) {
			console.log('Comment Controller');
			console.log('scope', $scope);

			$scope.$watch('kifu', function () {
				console.log('KIFU', $scope.kifu);
				if ($scope.kifu) {
					$scope.formData = {};

					$scope.listComments = function () {
						//console.log('list comments itself, checking path', $scope.path);
						if ($scope.path) {
							$http.get('/api/kifu/' +
								$scope.kifu._id + '/comments/' +
								pathString.stringify($scope.path)
							)
								.success(function (data) {
									$scope.comments = data;
									console.log(data);
								})
								.error(function (data) {
									console.log('Error: ' + data);
								});
						}
					};

					$scope.addComment = function () {
						var data = $scope.formData;
						data._id = $scope.kifu._id;
						data.path = pathString.stringify($scope.path);
						console.log('checking data', data);

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
					$scope.listComments();

					setInterval(function () {
						$scope.listComments();
					}, 3000);

					$scope.$on('path', function (event, path) {
						console.log('received broadcast for path', path);
						console.log('$scope.path', $scope.path);
						$scope.listComments();
					});
				}
			});
		}
	]);
