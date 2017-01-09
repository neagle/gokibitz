angular.module('gokibitz.controllers')
	.controller('EmbedController', function ($scope, $uibModalInstance, $location, id) {
		$scope.id = id;
		$scope.cancel = function (callback) {
			$uibModalInstance.dismiss('cancel');
		};
	});
