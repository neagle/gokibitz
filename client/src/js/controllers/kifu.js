/*jshint browser:true*/
angular.module('gokibitz.controllers')
	.controller('KifuController', [
		'$rootScope',
		'$scope',
		'$http',
		'$routeParams',
		'$location',
		'pathFilter',
		function ($rootScope, $scope, $http, $routeParams, $location, pathFilter) {
			require('../lib/wgo/wgo.js');
			require('../lib/wgo/wgo.player.min.js');
			require('../lib/wgo/basicplayer.commentbox.js');
			console.log('kifu control', $routeParams);


			$http.get('/api/kifu/' + $routeParams.shortid)
				.success(function (data) {
					console.log('data', data);
					$scope.kifu = data;
					console.log('scope kifu', $scope.kifu);

					// Get the initial path from the URL
					var initialPath = $location.search().path;
					initialPath = pathFilter(initialPath, 'object');
					$scope.kifu.path = initialPath;

					var elem = document.getElementById('player');

					// Initialize the player
					var player = new window.WGo.BasicPlayer(elem, {
						sgf: data.game.sgf,
						board: {
							background: '/images/kaya/kaya-texA3.jpg',
							font: 'Righteous'
						},
						move: initialPath,
						enableWheel: false,
						formatMoves: true,
						update: function (event) {
							// TODO: Is this a reasonable way of creating one situation where
							// an update to the $scope.kifu.path variable shouldn't update
							// the player object?
							$scope.updating = true;
							if (!$scope.$$phase) {
								$scope.$apply(function () {
									$scope.kifu.path = event.path;
								});
							}
							$scope.updating = false;
						}
					});
					player.setCoordinates(true);
					$scope.player = player;
					window.player = player;

					$scope.$watch('kifu.path', function (newValue, oldValue) {
						console.log('watching the path', newValue, oldValue);

						if (newValue) {
							if (newValue.m > 0) {
								$location.search('path', pathFilter(newValue, 'string'));
							} else {
								$location.search('path', null);
							}

							// If the change comes from a player update,
							// don't goTo the new path.
							if (!$scope.updating) {
								player.goTo(newValue);
							}
						}
					}, true);

				})
				.error(function (data) {
					console.log('Error:', data);
				});
		}
	]);
