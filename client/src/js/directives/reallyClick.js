angular.module('gokibitz.directives')
.directive('gkReallyClick',
	function ($uibModal) {
		var ModalInstanceCtrl = function ($scope, $uibModalInstance) {
			$scope.ok = function () {
				$uibModalInstance.close();
			};

			$scope.cancel = function () {
				$uibModalInstance.dismiss('cancel');
			};
		};

		return {
			restrict: 'A',
			scope: {
				gkReallyClick: '&'
			},
			link: function (scope, element, attrs) {
				element.bind('click', function () {
					var message = attrs.gkReallyMessage || 'Are you sure?';
					var btnClass = attrs.gkReallyClass || 'btn-primary';
					var verb = attrs.gkReallyVerb || 'OK';

					var modalHtml = '<div class="modal-header"><h3 class="modal-title">Confirm</h3></div>' +
						'<div class="modal-body">' + message + '</div>' +
						'<div class="modal-footer">' +
						'<button class="btn ' + btnClass + '" ng-click="ok()">' + verb + '</button>' +
						'<button class="btn btn-warning" ng-click="cancel()">Cancel</button>' +
						'</div>';

					var modalInstance = $uibModal.open({
						template: modalHtml,
						controller: ModalInstanceCtrl
					});

					modalInstance.result.then(function () {
						scope.gkReallyClick();
					}, function () {
						// Modal dismissed
					});

				});
			}
		};
	}
);
