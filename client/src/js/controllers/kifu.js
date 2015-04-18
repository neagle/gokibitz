/*jshint browser:true, maxparams: 10000000 */
/*global WGo:true*/
angular.module('gokibitz.controllers')
.controller('KifuController', function (
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
	var smartgame = require('smartgame');
	var smartgamer = require('smartgamer');

	// Make the login/signup modal avaialble
	$scope.LoginSignup = LoginSignup;

	var comments = require('../helpers/comments.js');

	$scope.sgfLink = '/api/kifu/' + $routeParams.shortid + '/sgf';

	$scope.kifu = kifu.data;

	// Check if the current path is in a variation, or on the primary tree
	function inVariation(path) {
		for (var variation in path) {
			if (variation !== 'm' && path[variation] !== 0) {
				// path is in a variation
				return true;
			}
		}
		// path is on the primary tree
		return false;
	}

	// Get the initial path from the URL
	var initialPath = $location.search().path;
	initialPath = pathFilter(initialPath, 'object');
	$scope.kifu.path = initialPath;

	// Fired every time the player updates
	$scope.playerUpdate = function (event) {
		if (event.op === 'init') {
			return;
		}

		// In theory, this means it's the last move
		// (In theory, Communism works! IN THEORY.)
		if (!inVariation(event.path) && !event.node.children.length) {
			$scope.lastMove = true;
		} else {
			$scope.lastMove = false;
		}

		// Make sure this happens in the next digest cycle
		$timeout(function () {
			var move;

			if (!$scope.editMode && !$scope.variationMode) {

				$scope.kifu.path = event.path;
				$scope.captures = event.position.capCount;

				move = $scope.kifu.path.m;

				if (move > 0) {
					// Put the move in the query string for super sweet permalinks
					$location.search('path', pathFilter($scope.kifu.path, 'string'));
				} else {
					// For move zero, no permalink needed
					$location.search('path', null);
				}
			}

			// Format game comments
			$scope.nodeComment = event.node.comment;
			$scope.sgfComment = comments.format(event.node.comment);
		});
	};

	$scope.toggleKifuVarMode = function () {
		$scope.variationMode = !$scope.variationMode;
		$scope.toggleEditMode();
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

	// Edit mode lets owners actually edit their SGFs by interacting with the board
	// TODO: Complete this implementation
	$scope.toggleEditMode = function () {
		var newMode;

		$scope._editable = $scope._editable || new WGo.Player.Editable($scope.player, $scope.player.board);
		newMode = !$scope._editable.editMode;
		$scope._editable.set(newMode, false);
		$scope.editMode = newMode;
	};

	// Let touchscreen users swipe left and right to navigate
	$scope.swipeLeft = function (event) {
		$scope.player.next();
	};

	$scope.swipeRight = function (event) {
		$scope.player.previous();
	};

	// TODO: Use this method of getting the edited version of the SGF and doing
	// something useful with it (like save it)
	$scope.getSgf = function () {
		console.log($scope.player.kifuReader.kifu.toSgf());
	};


	// When the path in the query string changes, go to that move
	$scope.$on('$routeUpdate', function () {
		var path = $location.search().path;
		var newPath = pathFilter(path);

		if (!angular.equals(newPath, $scope.kifu.path)) {
			$scope.player.goTo(newPath);
		}
	});

	// Open a modal with embed code
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
	};

	$scope.editGameComment = false;

	$scope.toggleEditGameComment = function () {
		$scope.editGameComment = !$scope.editGameComment;

		if ($scope.editGameComment) {
			$scope.originalNodeComment = $scope.nodeComment;
		}
	};

	$scope.cancelGameComment = function () {
		$scope.nodeComment = $scope.originalNodeComment;
		$scope.editGameComment = false;
	};

	$scope.saveGameComment = function () {
		$scope.savingGameComment = true;

		var gamer = smartgamer(smartgame.parse($scope.kifu.game.sgf));
		gamer.goTo($scope.kifu.path);
		gamer.comment($scope.nodeComment);
		var sgf = smartgame.generate(gamer.getSmartgame());
		$http.put('/api/kifu/' + $scope.kifu._id + '/sgf', {
			sgf: sgf
		})
			.success(function () {
				$scope.savingGameComment = false;
				$scope.editGameComment = false;
				$scope.sgfComment = comments.format($scope.nodeComment);
				$scope.player.kifuReader.node.comment = $scope.nodeComment;

			})
			.error(function () {
				console.log('error', arguments);
				$scope.savingGameComment = false;
			});
	};

});
