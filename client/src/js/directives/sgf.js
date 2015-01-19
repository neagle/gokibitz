angular.module('gokibitz.directives')
.directive('sgf', function ($window, $document) {
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

			$scope.board = $scope.board ||  {
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

			$scope.mark = function(move) {
				var x, y;

				x = move.charCodeAt(0) - 'a'.charCodeAt(0);

				if (x < 0) {
					x += 'a'.charCodeAt(0) - 'A'.charCodeAt(0);
				}

				// Account for the absence of the letter I in the coordinates
				if (x > 7) {
					x -= 1;
				}

				y = (move.charCodeAt(1)-'0'.charCodeAt(0));

				if (move.length > 2) {
					y = y * 10 + (move.charCodeAt(2) - '0'.charCodeAt(0));
				}

				y = $scope.player.kifuReader.game.size - y;

				$scope.player._tmp_mark = {
					type: 'MA',
					x: x,
					y: y
				};

				$scope.player.board.addObject($scope.player._tmp_mark);
			}

			$scope.unmark = function() {
				$scope.player.board.removeObject($scope.player._tmp_mark);
				delete $scope.player._tmp_mark;
			}

			// Bind events
			$document.bind('mouseover', function (event) {
				if (angular.element(event.target).hasClass('wgo-move-link')) {
					$scope.mark(event.target.innerHTML);
				}
			});

			$document.bind('mouseout', function (event) {
				if (angular.element(event.target).hasClass('wgo-move-link')) {
					$scope.unmark();
				}
			});

			$scope.player.addEventListener('update', function () {
				// Remove any temporary markers
				if ($scope.player._tmp_mark) {
					$scope.unmark();
				}
			});
		}
	};
});
