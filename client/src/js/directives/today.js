angular.module('gokibitz.directives')
	.directive('today', function () {
		return {
			restrict: 'E',
			scope: {
				src: '='
			},
			template: '<time></time>',
			link: function ($scope, element, attributes) {
				// console.log('I am date hear me roar', element);
				// var time = element.children()[0];
				// console.log('date', time);
				//element.text('hello world');
				//time.innerHTML('hey');

			}
		};
	});
