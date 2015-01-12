angular.module('gokibitz.controllers')
.controller('NavbarController',
	function ($rootScope, $scope, Auth, $location, $modal, $localStorage) {
    var nav = this;

    $scope.isCollapsed = true;
    nav.$storage = $localStorage;

    $scope.menu = [{
      'title': 'Kifu',
      'link': 'kifu'
    }];

    $scope.authMenu = [{
      'title': 'Upload',
      'link': 'upload'
    }];

    $scope.loginModal = function () {
      $modal.open({
        templateUrl: '/partials/login',
        controller: 'LoginController'
      });
    };

    $scope.signupModal = function () {
      $modal.open({
        templateUrl: '/partials/signup',
        controller: 'SignupController'
      });
    };

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
        nav.$storage.lastSeenNotification = nav.mostRecentNotification;
      }
    };
  }
);
