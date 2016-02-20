/**
 * Custom sticky behavior for SGFs
 */
angular.module('gokibitz.directives')
.directive('sticky', function ($window, $document, debounce) {
	return {
		restrict: 'A',
		link: function ($scope, elem, attrs) {
			// There are a lot of hard-coded values in this. I'll pay for it later.
			var $win = angular.element($window);
			var document = $document[0];
			var doc = document.documentElement;
			var scroll;

			// Allocate space for the header and the footer
			var topSpace = 70;
			var bottomSpace = 140;

			var rect, elemHeight;
			function recalc() {
				rect = elem[0].getBoundingClientRect();
				elemHeight = elem[0].offsetHeight;
				elem[0].parentNode.style.minHeight = elemHeight + 10 + 'px';
			}

			// Cross-browser getDocHeight function
			// (I miss jQuery.)
			function getDocHeight() {
				return Math.max(
					document.body.scrollHeight, document.documentElement.scrollHeight,
					document.body.offsetHeight, document.documentElement.offsetHeight,
					document.body.clientHeight, document.documentElement.clientHeight
				);
			}

			// Turn scroll behavior off for narrower widths
			function resize() {
				if ($window.innerWidth >= 992) {
					$win.on('scroll', scroll);
				} else {
					$win.off('scroll');
					elem[0].style.position = null;
					elem[0].style.top = 0;
					elem[0].style.bottom = null;
				}
			}

			scroll = function () {
				var top = ($window.pageYOffset || doc.scrollTop)  - (doc.clientTop || 0);
				var totalHeight = top - topSpace;

				if (top >= topSpace) {
					elem[0].style.position = 'fixed';
					elem[0].style.top = topSpace + 'px';
					elem[0].style.left = rect.left + 'px';
					elem[0].style.bottom = null;

					var bottomStick = getDocHeight() - topSpace - bottomSpace - elemHeight;

					if (totalHeight > bottomStick) {
						elem[0].style.position = 'absolute';
						elem[0].style.left = null;
						elem[0].style.top = bottomStick + 'px';
					}
				} else if (elem[0].style.position === 'fixed') {
					elem[0].style.position = 'relative';
					elem[0].style.top = 0;
					elem[0].style.left = null;
					elem[0].style.bottom = null;
				}
			};

			$win.on('resize', debounce(20, resize));

			$document.ready(function () {
				recalc();
				resize();
			});
		}
	};
});
