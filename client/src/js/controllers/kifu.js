/*jshint browser:true*/
angular.module('gokibitz.controllers')
	.controller('KifuController',  function (
		$rootScope,
		$scope,
		$http,
		$routeParams,
		$location,
		pathFilter,
		LoginSignup
	) {
		// Make the login/signup modal avaialble
		$scope.LoginSignup = LoginSignup;

		var comments = require('../helpers/comments.js');

		$http.get('/api/kifu/' + $routeParams.shortid)
			.success(function (data) {
				//console.log('data', data);
				$scope.kifu = data;
				//console.log('scope kifu', $scope.kifu);

				// Get the initial path from the URL
				var initialPath = $location.search().path;
				initialPath = pathFilter(initialPath, 'object');
				$scope.kifu.path = initialPath;

				var elem = document.getElementById('player');

				// Initialize the player
				var player = new window.WGo.BasicPlayer(elem, {
					sgf: data.game.sgf,
					board: {
						//background: '/images/kaya/kaya-texA3.jpg',
						stoneHandler: window.WGo.Board.drawHandlers.FLAT,
						font: 'Righteous',
						theme: {
							gridLinesColor: 'hsl(50, 50%, 30%)',
							gridLinesWidth: function(board) {
								return board.stoneRadius/15;
							},
							starColor: 'hsl(50, 50%, 30%)',
						}
					},
					layout: [
						// Default
						{
							className: 'wgo-onecol wgo-xsmall',
							layout: {
								bottom: ['Control']
							}
						}
					],
					move: initialPath,
					enableWheel: false,
					formatMoves: true,
					update: function (event) {
						//console.log('update event yo', event);
						//console.log(event.node.children.length);
						// TODO: Is this a reasonable way of creating one situation where
						// an update to the $scope.kifu.path variable shouldn't update
						// the player object?
						$scope.captures = event.position.capCount;
						//$scope.info.black.captures = event.position.capCount.black;
						//$scope.info.white.captures = event.position.capCount.white;
						$scope.updating = true;
						if (!$scope.$$phase) {
							$scope.$apply(function () {
								$scope.kifu.path = event.path;
							});
						}
						$scope.updating = false;

						$scope.sgfComment = comments.format(event.node.comment);
					}
				});
				$scope.info = player.kifu.info;
				//console.log('player.kifu.info', player.kifu.info);
				player.setCoordinates(true);
				$scope.player = player;
				//window.player = player;
				//window.$scope = $scope;

				$scope.$on('$routeUpdate', function () {
					var path = $location.search().path;
					if (path) {
						var newPath = pathFilter(path);
						$scope.kifu.path = newPath;
					}
				});

				$scope.$watch('kifu.path', function (newValue, oldValue) {
					//console.log('watching the path', newValue, oldValue);
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
	);
