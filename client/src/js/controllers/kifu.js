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
			$interpolate
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

      function initializePlayer() {
        var elem = document.getElementById('player');

        // Initialize the player
        // TODO: This config should be abstracted somewhere
        return new window.WGo.BasicPlayer(elem, {
          sgf: kifu.data.game.sgf,
          board: {
						background: '',
            stoneHandler: window.WGo.Board.drawHandlers.FLAT,
            font: 'Righteous',
            theme: {
              gridLinesColor: 'hsl(50, 50%, 30%)',
              gridLinesWidth: function(board) {
                return board.stoneRadius/15;
              },
              starColor: 'hsl(50, 50%, 30%)',
            }
          },
          layout: [
            // Default
            {
              className: 'wgo-onecol wgo-xsmall',
              layout: {
                bottom: ['Control']
              }
            }
          ],
          move: initialPath,
          enableWheel: false,
          formatMoves: true,
          update: playerUpdate
        });
      }

      // Fired every time the player updates
      function playerUpdate(event) {
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
      }

      var player = initializePlayer();

			// Make the player object globally accessible
			// Necessary for move labels
			// TODO: See if there's a way to eliminate this requirement
			window.player = player;

			$scope.swipeLeft = function (event) {
				player.next();
			};

			$scope.swipeRight = function (event) {
				player.previous();
			}


      // Make kifu info available to $scope
      $scope.info = player.kifu.info;

      // Set the page title
      var titleTemplate = $interpolate(
				'{{ white.name || "Anonymous" }} {{ white.rank }} vs. {{ black.name || "Anonymous" }} {{ black.rank }} – GoKibitz'
      );
			var pageTitle = titleTemplate($scope.info);
      $rootScope.pageTitle = pageTitle;

      // Turn on coordinates
      player.setCoordinates(true);

      $scope.$on('$routeUpdate', function () {
        var path = $location.search().path;
        var newPath = pathFilter(path);

        if (!angular.equals(newPath, $scope.kifu.path)) {
          player.goTo(newPath);
        }
      });
		}
	);
