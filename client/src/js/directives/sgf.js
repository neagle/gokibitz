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
			//console.log('element', element);
			var div = element.children()[0];
			var player = new window.WGo.BasicPlayer(div, {
				board: {
					background: '/images/kaya/kaya-texA3.jpg'
				},
				move: 100,
				sgf: $scope.src,
				enableWheel: false,
				layout: {}
			});

		}
	}
});
