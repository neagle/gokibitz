var $ = require('jquery');

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

			player: '=?',

			alwaysVisible: '@?'
		},
		template: '<div></div>',
		link: function ($scope, element, attributes) {

			if (!$scope.src) {
				return;
			}

			console.log('$scope.alwaysVisible', $scope.alwaysVisible);


			var div = element.children()[0];


			// jQuery Objects
			var $element = $(element);
			var $div = $(div);
			var $nav = $('#gk-navbar');
			var $parent = $element.parent();

			function sizeSgf() {
				console.log('$nav.outerHeight(true)', $nav.outerHeight(true));
				var height = $window.innerHeight -
					$nav.outerHeight(true) -
					($parent.outerHeight(true) - $parent.height());

				console.log('height', height);
				$div.height(height);

				$parent.height(height);
				var right = $window.innerWidth - ($parent.offset().left + $parent.outerWidth());
				$element.css({
					//position: 'fixed',
					right: right,
					top: $parent.offset().top
				});
			}

			function positionSgf() {
				$element.css({
					position: 'fixed'
				});
			}


			$scope.board = $scope.board || {
				background: '',
				stoneHandler: $window.WGo.Board.drawHandlers.FLAT,
				// Strangely, this has to be on both the board and its theme. Possibly
				// inadvertent inconsistency in WGo?
				font: 'Righteous',
				theme: {
					//coordinatesBackgroundColor: 'hsla(0, 50%, 50%, 0.3)',
					coordinatesBackgroundColor: 'hsla(30, 40%, 100%, 0.5)',
					coordinatesBackgroundColorVariation: 'hsla(100, 40%, 100%, 0.5)',
					coordinatesColor: 'hsla(30, 40%, 25%, 0.5)',
					font: 'Righteous',
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

			// Size this thing
			if ($scope.alwaysVisible) {
				sizeSgf();
			}

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

			positionSgf();

			// Make kifu info available to the outside world
			$scope.info = $scope.player.kifu.info;
			console.log('$scope.info', $scope.info);


			// Set coordinates on or off
			$scope.player.setCoordinates('coordinates' in attributes);

			var animateTimer;
			$scope.player.displaySequence = function (sequence, firstMove) {

				// Restore the last move, if it was removed
				$scope.player.update();

				sequence = sequence.split('-');
				sequence = sequence.map(normalizeCoordinates);

				if (firstMove) {
					firstMove = (firstMove === 'W') ? -1 : 1;
				}

				var lastMove = $scope.player.kifuReader.node.move;

				// Use the last color played as the default
				var color = firstMove || lastMove.c;

				if (lastMove.c === color) {
					$scope.player.board.removeObjectsAt(lastMove.x, lastMove.y);
					$scope.player.missingMove = lastMove;
				}

				$scope.player.temporarySequence = [];
				sequence.forEach(function (move, i) {
					var stone = angular.extend({}, move, {
						type: 'FLAT',
						c: color
					});

					var label = angular.extend({}, move, {
						type: 'LB',
						text: i + 1,
						c: (color === 1) ? 'hsl(0, 0%, 90%)' : 'hsl(0, 0%, 30%)'
					});

					console.log('playing a stone');
					var knode = new WGo.KNode({
						move: {
							x: move.x,
							y: move.y,
							c: color
						}
					});
					console.log('knode', knode);
					//$scope.player.play(move.x, move.y, move.c);
					//$scope.player.kifuReader.node.appendChild(new WGo.KNode({
						//move: {
							//x: move.x,
							//y: move.y,
							//c: color
						//}
					//}));

					$scope.player.temporarySequence.push(knode);
					//$scope.player.temporarySequence.push(stone);
					//console.log('making a label');
					$scope.player.temporarySequence.push(label);

					color = color * -1;

					//$scope.player.next($scope.player.kifuReader.node.children.length-1);

				});

				//$scope.player.temporarySequence.forEach(function (item) {
				//	$scope.player.board.addObject(item);
				//});

				function display(sequence) {
					$scope.player.kifuReader.node.appendChild(sequence[0]);
					//$scope.player.board.addObject(sequence[0]);
					$scope.player.board.addObject(sequence[1]);
					$scope.player.next($scope.player.kifuReader.node.children.length-1);

					if (sequence.length > 2) {
						animateTimer = $timeout(function () {
							display(sequence.slice().splice(2));
						}, 500);
					}
				}

				$timeout.cancel(animateTimer);
				display($scope.player.temporarySequence);
			};

			// Turn a3 into { x: 2, y: 16 }
			// TODO: This function obviously belongs some place universal.
			normalizeCoordinates = function (move) {
				var x, y;
				var numRegExp = /[0-1]?[0-9]/;

				// Note the missing i
				var letters = 'abcdefghjklmnopqrst';

				y = numRegExp.exec(move)[0];
				y = $scope.player.kifuReader.game.size - y;

				x = move.replace(numRegExp, '').toLowerCase();
				//
				// If there's an extra letter in the move (indicating color, probably)
				// just chop it off
				if (x.length > 1) {
					x = x.substring(x.length - 1);
				}

				// Turn the letter into a number using our letters key
				x = letters.indexOf(x);

				return { x: x, y: y };
			};

			// Add a marker to the goban
			$scope.player.mark = function(move, options) {
				var defaults = {
					type: 'MA' // Default mark is: X
				};

				options = angular.extend({}, defaults, options);

				var temporaryMarker = move;
				if (typeof temporaryMarker !== 'object') {
					temporaryMarker = normalizeCoordinates(temporaryMarker);
				}
				temporaryMarker = angular.extend(temporaryMarker, options);

				$scope.player.temporaryMarker = temporaryMarker;

				$scope.player.board.addObject($scope.player.temporaryMarker);
			};

			// Remove the temporary marker from the goban
			$scope.player.unmark = function() {
				$scope.player.board.removeObject($scope.player.temporaryMarker);
				delete $scope.player.temporaryMarker;
			};

			$scope.player.removeSequence = function () {
				$timeout.cancel(animateTimer);
				if ($scope.player.temporarySequence) {
					$scope.player.temporarySequence.forEach(function (item) {
						$scope.player.board.removeObject(item);
					});
					delete $scope.player.temporarySequence;
				}
			};

			$scope.player.addEventListener('update', function (event) {
				if ($scope.player.missingMove && event.change.add.length) {
					$scope.player.board.addObject($scope.player.missingMove);
					delete $scope.player.missingMove;
				}

				// Remove any temporary markers
				if ($scope.player.temporaryMarker) {
					$scope.player.unmark();
				}

				// Remove any sequence
				if ($scope.player.temporarySequence) {
					$scope.player.removeSequence();
				}
			});

			$scope.labelIsActive = function () {
				console.log('label is active arguments', arguments);
				return false;
			};
		}
	};
});

