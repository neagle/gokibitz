angular.module('gokibitz.directives')
.directive('sgf', function ($window, $document, $timeout) {
	return {
		restrict: 'E',
		scope: {
			// The SGF's source data
			src: '=',

			// Set the board's coordinate markers' (on the sides) visibility
			coordinates: '=?',

			// The directive will make game info available here
			info: '=?',

			// What move to start at
			start: '=?',

			// This function will be called on player updates
			update: '&?',

			// WGo.js board object
			board: '=?',

			// WGo.js layout object
			layout: '=?',

			player: '=?'
		},
		template: '<div></div>',
		link: function ($scope, element, attributes) {
			if (!$scope.src) {
				return;
			}

			var div = element.children()[0];

			$scope.board = $scope.board || {
				background: '',
				stoneHandler: window.WGo.Board.drawHandlers.FLAT,
				font: 'Righteous',
				theme: {
					gridLinesColor: 'hsl(50, 50%, 30%)',
					gridLinesWidth: function(board) {
						return board.stoneRadius/15;
					},
					starColor: 'hsl(50, 50%, 30%)',
				}
			};

			$scope.layout = $scope.layout || [
				// Default
				{
					className: 'wgo-onecol wgo-xsmall',
					layout: {
						bottom: ['Control']
					}
				}
			];

			$scope.player = new $window.WGo.BasicPlayer(div, {
				board: $scope.board,
				move: $scope.start || 0,
				sgf: $scope.src,
				enableWheel: false,
				layout: $scope.layout,
				update: function (event) {
					$scope.update({ event: event });
				}
			});

			// Make kifu info available to the outside world
			$scope.info = $scope.player.kifu.info;

			// Set coordinates on or off
			$scope.player.setCoordinates('coordinates' in attributes);
		}
	};
});
