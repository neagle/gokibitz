angular.module('gokibitz.directives')
.directive('gkReallyClick', [
	'$modal',
	function ($modal) {
		var ModalInstanceCtrl = function($scope, $modalInstance) {
			$scope.ok = function() {
				$modalInstance.close();
			};

			$scope.cancel = function() {
				$modalInstance.dismiss('cancel');
			};
		};

		return {
			restrict: 'A',
			scope: {
				gkReallyClick: '&'
			},
			link: function (scope, element, attrs) {
				element.bind('click', function() {
					var message = attrs.gkReallyMessage || 'Are you sure?';
					var btnClass = attrs.gkReallyClass || 'btn-primary';
					var verb = attrs.gkReallyVerb || 'OK';

					var modalHtml = '<div class="modal-header"><h3 class="modal-title">Confirm</h3></div>' +
						'<div class="modal-body">' + message + '</div>' +
						'<div class="modal-footer">' +
						'<button class="btn ' + btnClass + '" ng-click="ok()">' + verb + '</button>' +
						'<button class="btn btn-warning" ng-click="cancel()">Cancel</button>' +
						'</div>';

					var modalInstance = $modal.open({
						template: modalHtml,
						controller: ModalInstanceCtrl
					});

					modalInstance.result.then(function() {
						scope.gkReallyClick();
					}, function() {
						// Modal dismissed
					});

				});
			}
		};
	}
]);
