console.log('authservice');
angular.module('gokibitz.services')
	.factory('AuthService', function ($http, Session) {
		return {
			login: function (credentials) {
				return $http
					.post('/login', credentials)
					.then(function (res) {
						Session.create(res.id, res.userid, res.role);
					});
			},
			isAuthenticated: function () {
				return !!Session.userId;
			},
			isAuthorized: function (authorizedRoles) {
				if (!angular.isArray(authorizedRoles)) {
					authorizedRoles = [authorizedRoles];
				}
				return (
					this.isAuthenticated() &&
					authorizedRoles.indexOf(Session.userRole) !== -1
				);
			}
		};
	})
	.factory('AuthInterceptor', function ($rootScope, $q, AUTH_EVENTS) {
		return {
			responseError: function (response) {
				if (response.status === 401) {
					$rootScope.$broadcast(AUTH_EVENTS.notAuthenticated, response);
				}
				if (response.status === 403) {
					$rootScope.$broadcast(AUTH_EVENTS.notAuthorized, response);
				}
				if (response.status === 419 || response.status === 440) {
					$rootScope.$broadcast(AUTH_EVENTS.sessionTimeout, response);
				}
				return $q.reject(response);
			}
		};
	});
