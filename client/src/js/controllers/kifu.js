/*jshint browser:true*/
angular.module('gokibitz.controllers')
	.controller('KifuController', [
		'$rootScope',
		'$scope',
		'$http',
		'$routeParams',
		function ($rootScope, $scope, $http, $routeParams) {
			require('../lib/wgo/wgo.js');
			require('../lib/wgo/wgo.player.min.js');
			console.log('kifu control', $routeParams);

			$http.get('/api/kifu/' + $routeParams.shortid)
				.success(function (data) {
					console.log('data', data);
					$scope.kifu = data;
					console.log('scope kifu', $scope.kifu);

					var elem = document.getElementById('player');
					var player = new window.WGo.BasicPlayer(elem, {
						sgf: data.game.sgf,
						board: {
							background: '/images/kaya/kaya-texA3.jpg'
						},
						enableWheel: false,
						update: function (event) {
							//console.log('update', event);
							var move = event.path.m;

							if (move >= 0) {
								//console.log('$rootScope', $rootScope);
								$scope.move = move;
								//console.log('$scope.move', $scope.move);
								$rootScope.$broadcast('move', move);
							}
						}
					});

				})
				.error(function (data) {
					console.log('Error:', data);
				});
		}
	]);
