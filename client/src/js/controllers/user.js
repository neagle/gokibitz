var _ = require('lodash');

angular.module('gokibitz.controllers')
	.controller('UserController',
		function ($rootScope, $scope, $routeParams, user, $http) {
			$scope.user = user.data;
			$rootScope.pageTitle = $scope.user.username + ' – GoKibitz';

			$scope.edit = false;

			if (!$scope.currentUser) {
				$scope.isMine = false;
			} else {
				if ($scope.user.username === $scope.currentUser.username)	{
					$scope.isMine = true;
				} else {
					$scope.isMine = false;
				}
			}

			// Valid ranks are 30-1k, 1-9d, and 1-9p
			$scope.isValidRank = function (rank) {
				var rankArr;
				var suffixes = ['k', 'd', 'p'];
				var suffix;

				// Try to split the rank string by any of the known suffixes
				for (var i = 0; rankArr.length < 2 && i < suffixes.length; i += 1) {
					suffix = suffixes[i];
					rankArr = rank.split(suffix);
				}

				// Rank wasn't split by any of the suffixes, so it's definitely not valid
				if (rankArr.length !== 2) {
					return false;
				}

				var number = Number(rankArr[0]);
				var suffix = suffixes[i];

				// first part has to be a number
				if (isNaN(number)) {
					return false;
				}

				// k, d, or p, not kyu, dan, or pro
				if (rankArr[1].length) {
					return false;
				}

				// Valid kyu ranks are between 30 and 1
				if (suffix === 'k') {
					if (number > 30 || number < 1) {
						return false;
					}
				}

				// Valid dan ranks are between 1 and 9
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
				$http.put('/api/user/' + $scope.user.username, _.pick($scope.profile, _.identity))
					.success(function (data, status, headers, config) {
						$scope.user = data.user;
						$scope.edit = false;
					})
					.error(function (data, status, headers, config) {
						$scope.editError = data;
						console.log('hey');
					});
			};

		}
	);
