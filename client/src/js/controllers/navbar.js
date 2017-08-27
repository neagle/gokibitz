angular.module('gokibitz.controllers')
.controller('NavbarController', function ($rootScope, $scope, Auth, $location, $uibModal, Settings) {
	var nav = this;

	$scope.isCollapsed = true;

	$scope.$watch('currentUser', function (newValue, oldValue) {
		if (newValue) {
			nav.$settings = new Settings();
			nav.$settings.$get({ keys: ['lastSeenNotification'] });
		}
	});

	$scope.menu = [];
	$scope.authMenu = [];

	if (!$rootScope.iframed) {
		$scope.menu.push({
			'title': 'Kifu',
			'link': 'kifu'
		});

		$scope.authMenu.push({
			'title': 'Upload',
			'link': 'upload'
		});
	}

	$scope.loginModal = function () {
		$uibModal.open({
			templateUrl: '/partials/login',
			controller: 'LoginController'
		});
	};

	$scope.signupModal = function () {
		$uibModal.open({
			templateUrl: '/partials/signup',
			controller: 'SignupController'
		});
	};

	$scope.passwordModal = function () {
		$uibModal.open({
			templateUrl: '/partials/password',
			controller: 'PasswordController'
		});
	};

	// $scope.passwordModal();

	$scope.logout = function () {
		Auth.logout(function (err) {
			if (!err) {
				$location.path('/');
				$rootScope.flash = {
					type: 'success',
					message: 'You have logged out. Hope to see you again soon!'
				};
			}
		});
	};

	$scope.notificationToggle = function (isOpen) {
		if (isOpen) {
			nav.$settings.lastSeenNotification = {
				id: nav.mostRecentNotification.id,
				date: nav.mostRecentNotification.date
			};
			nav.$settings.$update();
		}
	};
});
