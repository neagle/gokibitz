/*jshint browser:true*/
angular.module('gokibitz.controllers')
	.controller('KifuController',
		function (
      $rootScope,
      $scope,
      $http,
      $timeout,
      $routeParams,
      $location,
      pathFilter,
      LoginSignup,
      kifu,
			$interpolate,
			$document,
			$modal
    ) {
      // Make the login/signup modal avaialble
      $scope.LoginSignup = LoginSignup;

      var comments = require('../helpers/comments.js');

      $scope.sgfLink = '/api/kifu/' + $routeParams.shortid + '/sgf';

      $scope.kifu = kifu.data;

      // Get the initial path from the URL
      var initialPath = $location.search().path;
      initialPath = pathFilter(initialPath, 'object');
      $scope.kifu.path = initialPath;

      // Fired every time the player updates
      $scope.playerUpdate = function (event) {
        if (event.op === 'init') {
          return;
        }

        $timeout(function () {
          $scope.kifu.path = event.path;

          $scope.captures = event.position.capCount;

          var move = $scope.kifu.path.m;

          if (move > 0) {
            $location.search('path', pathFilter($scope.kifu.path, 'string'));
          } else {
            $location.search('path', null);
          }

					// Format game comments
          $scope.sgfComment = comments.format(event.node.comment);
        });
      };

			// Set the page title
			var titleTemplate = $interpolate(
				'{{ white.name || "Anonymous" }} {{ white.rank }} vs. {{ black.name || "Anonymous" }} {{ black.rank }} – GoKibitz'
			);
			$scope.$watch('info', function () {
				if ($scope.info) {
					var pageTitle = titleTemplate($scope.info);
					$rootScope.pageTitle = pageTitle;
				}
			});

			$scope.toggleEditMode = function () {
				$scope._editable = $scope._editable || new WGo.Player.Editable($scope.player, $scope.player.board);
				$scope._editable.set(!$scope._editable.editMode);
				console.log('$scope._editable.editMode', $scope._editable.editMode);
			};

			$scope.swipeLeft = function (event) {
				$scope.player.next();
			};

			$scope.swipeRight = function (event) {
				$scope.player.previous();
			}

      $scope.$on('$routeUpdate', function () {
        var path = $location.search().path;
        var newPath = pathFilter(path);

        if (!angular.equals(newPath, $scope.kifu.path)) {
          $scope.player.goTo(newPath);
        }
      });

			$scope.embed = function (id) {
				$modal.open({
					templateUrl: '/partials/embed',
					controller: 'EmbedController',
					resolve: {
						id: function () {
							return $routeParams.shortid;
						}
					}
				});
			}
		}
	);
