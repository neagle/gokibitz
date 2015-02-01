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

	// Edit mode lets owners actually edit their SGFs by interacting with the board
	// TODO: Complete this implementation
	$scope.toggleEditMode = function () {
		var newMode;

		$scope._editable = $scope._editable || new WGo.Player.Editable($scope.player, $scope.player.board);
		newMode = !$scope._editable.editMode;
		$scope._editable.set(newMode, false);
		$scope.editMode = newMode;
	};

	// Variation mode lets users add variations to their comments by interacting with the board
	$scope.toggleVariationMode = function (startingColor) {
		var newMode;

		$scope._editable = $scope._editable || new WGo.Player.Editable($scope.player, $scope.player.board);
		newMode = !$scope._editable.editMode;

		var theme = $scope.player.board.theme;

		$scope.player.gkRecordingVariation = false;
		$scope._editable.set(newMode, true);
		$scope.variationMode = newMode;

		var lastMove = $scope.player.kifuReader.node.move;

		if ($scope.variationMode) {
			$scope.player.gkRecordingVariation = true;
			$scope.player.gkVariationArr = [];
		}

		if (!$scope.variationMode && $scope.player.oneBack) {
			$scope.player.gkRecordingVariation = false;
			$scope.player.next();
			$scope.player.oneBack = false;
			$scope.player.gkRecordingVariation = true;
		}
		if ($scope.variationMode && lastMove && lastMove.c === startingColor) {
			$scope.player.gkRecordingVariation = false;
			$scope.player.oneBack = true;
			$scope.player.previous();
			$scope.player.gkRecordingVariation = true;
		}
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
	}
});
