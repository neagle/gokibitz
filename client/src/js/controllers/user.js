var _ = require('lodash');

angular.module('gokibitz.controllers')
	.controller('UserController',
		function ($scope, $routeParams, user, $http) {
      console.log('user control', $routeParams, user);
			$scope.user = user.data;
			//console.log('$scope.user', $scope.user);
			//var username = $scope.user.username;
			//console.log('username', username);
			//$scope.username = $routeParams.username;

			$scope.edit = false;

			$scope.isMine = $scope.user.username === $scope.currentUser.username;

			// Valid ranks are 30-1k, 1-9d, and 1-9p
			$scope.isValidRank = function (rank) {
				rank = rank.toLowerCase();
				var suffixes = ['k', 'd', 'p'];

				var i = 0;
				do {
					rankArr = rank.split(suffixes[i]);
				}
				while (rankArr.length < 2 && suffixes[++i]);

				if (rankArr.length !== 2) {
					return false;
				}

				var number = Number(rankArr[0]);
				var suffix = suffixes[i];

				// first part has to be a number
				if (isNaN(number)) {
					return false;
				};

				// k, d, or p, not kyu, dan, or pro
				if (rankArr[1].length) {
					return false;
				}

				if (suffix === 'k') {
					if (number > 30 || number < 1) {
						return false;
					}
				}

				if (suffix === 'd' || suffix === 'p') {
					if (number > 9 || number < 1) {
						return false;
					}
				}

				return true;
			};

			function populateProfile() {
				$scope.profile	= {
					realName: $scope.user.realName || '',
					location: $scope.user.location || '',
					rank: $scope.user.rank || '',
					bio: $scope.user.bio || '',
					twitter: $scope.user.twitter || '',
					teacher: $scope.user.teacher || null,
					externalGoUsernames: $scope.user.externalGoUsernames || null,
					favorite: $scope.user.favorite || null
				};
			}

			// Populate the profile initially
			populateProfile();

			$scope.cancel = function () {
				populateProfile();
				$scope.edit = false;
			};

			$scope.save = function () {
				console.log('$scope.profile', $scope.profile);
				console.log('_.pick($scope.profile, _.identity)', _.pick($scope.profile, _.identity));
				$http.put('/api/user/' + $scope.user.username, _.pick($scope.profile, _.identity))
					.success(function (data, status, headers, config) {
						console.log('data.user', data.user);
						$scope.user = data.user;
            $scope.edit = false;
					})
					.error(function (data, status, headers, config) {
						$scope.editError = data;
					})
			};

			$scope.ping = function () {
				console.log('ping');
				$http.put('/api/user/' + $scope.user.username, {
					twitter: 'neagle',
					rubbish: 'blabh'
				})
			};
    }
  );
