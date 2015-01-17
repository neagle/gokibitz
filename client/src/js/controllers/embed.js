angular.module('gokibitz.controllers')
	.controller('EmbedController', function ($scope, $modalInstance, $location, id) {
		$scope.id = id;
		$scope.cancel = function (callback) {
			$modalInstance.dismiss('cancel');
		};
	});
