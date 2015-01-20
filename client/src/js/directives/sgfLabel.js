angular.module('gokibitz.directives')
.directive('sgfLabel', function ($document, $timeout) {
	return {
		restrict: 'E',
		link: function ($scope, element, attributes) {

			// Turn a3 into { x: 2, y: 16 }
			var normalizeCoordinates = function (move) {
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
			var mark = function(move, options) {
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
			var unmark = function() {
				$scope.player.board.removeObject($scope.player.temporaryMarker);
				delete $scope.player.temporaryMarker;
			};

			var animateTimer;
			var displaySequence = function (sequence) {

				// Restore the last move, if it was removed
				$scope.player.update();

				sequence = sequence.split('-');
				sequence = sequence.map(normalizeCoordinates);

				var firstMove;

				if (attributes.firstMove) {
					firstMove = (attributes.firstMove === 'W') ? -1 : 1;
				}

				var lastMove = $scope.player.kifuReader.node.move;

				if (lastMove.c === firstMove) {
					$scope.player.board.removeObjectsAt(lastMove.x, lastMove.y);
				}

				// Use the color whose turn it is next as the default
				var color = firstMove || lastMove.c * -1;

				$scope.player.temporarySequence = [];
				sequence.forEach(function (move, i) {
					var stone = angular.extend({}, move, {
						type: 'FLAT',
						c: color
					});

					var label = angular.extend({}, move, {
						type: 'LB',
						text: i + 1,
						c: (color === 1) ? 'white' : 'black'
					});

					$scope.player.temporarySequence.push(stone);
					$scope.player.temporarySequence.push(label);

					color = color * -1;
				});

				//$scope.player.temporarySequence.forEach(function (item) {
				//	$scope.player.board.addObject(item);
				//});

				function display(sequence) {
					$scope.player.board.addObject(sequence[0]);
					$scope.player.board.addObject(sequence[1]);

					if (sequence.length > 2) {
						animateTimer = $timeout(function () {
							display(sequence.slice().splice(2));
						}, 500);
					}
				}

				$timeout.cancel(animateTimer);
				display($scope.player.temporarySequence);
			};

			var removeSequence = function () {
				$timeout.cancel(animateTimer);
				if ($scope.player.temporarySequence) {
					$scope.player.temporarySequence.forEach(function (item) {
						$scope.player.board.removeObject(item);
					});
					delete $scope.player.temporarySequence;
				}
			};

			element.bind('click', function (event) {
				// Clear off any existing sequences
				removeSequence();

				// Remove active class from any active labels
				var active = $document[0].querySelectorAll('sgf-label.active');

				var currentlyActive = angular.element(event.target).hasClass('active');

				if (active.length) {
					for (var i = 0, length = active.length; i < length; i += 1) {
						var $elem = angular.element(active[i]);
						$elem.removeClass('active');
					}
				}

				if (!currentlyActive) {
					element.addClass('active');

					if (attributes.sequence) {
						displaySequence(attributes.sequence);
					}
				} else {
					$scope.player.update();
				}
			});

			element.bind('mouseover', function (event) {
				if (!attributes.sequence) {
					mark(event.target.innerHTML);
				}
			});

			element.bind('mouseout', function (event) {
				if (!attributes.sequence) {
					unmark();
				}
			});

			$scope.player.addEventListener('update', function () {
				// Remove any temporary markers
				if ($scope.player.temporaryMarker) {
					unmark();
				}

				// Remove any sequence
				if ($scope.player.temporarySequence) {
					removeSequence();
				}
			});
		}
	};
});
