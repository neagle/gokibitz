// Thanks, Mark Rajcok!
// http://stackoverflow.com/questions/14833326/how-to-set-focus-in-angularjs
angular.module('gokibitz.directives')
.directive('gkFocusMe', function($timeout, $parse) {
	return {
		//scope: true,   // optionally create a child scope
		link: function(scope, element, attrs) {
			// TODO: Is this the right away to access the model?
			var model = $parse(attrs.gkFocusMe);
			scope.$watch(model, function(value) {
				if(value === true) {
					$timeout(function() {
						element[0].focus();
					});
				}
			});
		}
	};
});
