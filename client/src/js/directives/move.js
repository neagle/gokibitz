// Transform <move num="X">move X</move> tags into links
angular.module('gokibitz.directives')
	.directive('move', function () {
		return {
			scope: {},
			restrict: 'E',
			controllerAs: 'ctrl',
			bindToController: {
				num: '@'
			},
			replace: true,
			transclude: true,
			template: `<a ng-href='{{ ctrl.href }}' ng-transclude></a>`,
			controller: function ($location, $attrs) {
				this.href = $location.path() + '?path=' + $attrs.num;
			}
		};
	});
