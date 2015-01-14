angular.module('gokibitz.directives')
.directive('sgf', function () {
	return {
		restrict: 'E',
		scope: {
			src: '='
		},
		template: '<div></div>',
		link: function ($scope, element, attributes) {
			//console.log('I am an sgf', arguments);
			//console.log('scope', $scope);
			//console.log(window.WGo.BasicPlayer);
			var div = element.children()[0];

			var startAt = { m: '100' };

			//console.log('theme', $scope.theme);
			//console.log('attributes', attributes);
			var themes = {
				default: {
					background: '',
					stoneHandler: window.WGo.Board.drawHandlers.FLAT,
					theme: {
						gridLinesColor: 'hsl(50, 50%, 30%)',
						gridLinesWidth: function(board) {
							return board.stoneRadius/15;
						},
						starColor: 'hsl(50, 50%, 30%)',
					}
				},
				background: {
					background: '',
					stoneHandler: window.WGo.Board.drawHandlers.FLAT,
					theme: {
						gridLinesColor: 'hsla(50, 50%, 30%, 0.1)',
						gridLinesWidth: function(board) {
							return board.stoneRadius/15;
						},
						starColor: 'hsl(50, 50%, 30%)',
					}
				}
			};

			var player = new window.WGo.BasicPlayer(div, {
				board: themes[attributes.theme] || themes.default,
				move: startAt,
				sgf: $scope.src,
				enableWheel: false,
				layout: {},
				update: function (event) {
					// This was here to restart the game if it hits the end, when the record is animated.
					// However, it caused a bug on records that aren't as long as the startAt value.
					//if (event.node.children.length === 0) {
					//	player.goTo({ m: startAt });
					//}
				}
			});

			//window.pl = player;
			if (attributes.animated) {
				var animate = setInterval(function () {
					player.next();
				}, 1000);
			}
		}
	};
});
