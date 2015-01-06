/*global angular*/

(function withAngular(angular) {
	'use strict';

	angular.module('720kb.socialshare', [])
		.directive('socialshare', function manageDirective ($window, $location) {

			return {
				restrict: 'A',
				link: function linkingFunction ($scope, element, attr) {

					var data = {};
					var propDefaults = {
						url: 	'',
						provider: '',
						text: '',
						media: '',
						hashtags: '',
						via: '',
						popupHeight: 500,
						popupWidth: 500,
						eventTrigger: 'click'
					};

					for (var key in propDefaults) {
						var attributeName = 'socialshare' + key.substring(0, 1).toUpperCase() + key.substring(1);
						if (attr[attributeName]) {
							// This closure preserves the value of key when fired by observe.
							// Something tells me I'm an idiot to be doing it this way.
							// Revisit when sitting next to someone kind and wiser?
							(function (key) {
								attr.$observe(attributeName, function (value) {
									data[key] = value;
								});
							})(key);
						} else {
							// Use the default
							data[key] = propDefaults[key];
						}
					}

					$scope.facebookShare = function manageFacebookShare (data) {

						$window.open(
							'//www.facebook.com/sharer/sharer.php?u=' + encodeURI(data.url)
							,'sharer', 'toolbar=0,status=0,width=' + data.popupWidth + ',height=' + data.popupHeight);
					};

					$scope.twitterShare = function manageTwitterShare (data) {
						var urlString = '//www.twitter.com/intent/tweet?';

						if (data.text) {
							urlString += 'text=' + encodeURI(data.text);
						}

						if (data.via) {
							urlString += '&via=' + encodeURI(data.via);
						}

						if (data.hashtags) {
							urlString += '&hashtags=' + encodeURI(data.hashtags);
						}

						urlString += '&url=' + encodeURI(data.url || $location.absUrl());

						$window.open(urlString, 'sharer', 'toolbar=0,status=0,width=' + data.popupWidth + ',height=' + data.popupHeight);
					};

					$scope.googlePlusShare = function manageGooglePlusShare (data) {

						$window.open(
							'//plus.google.com/share?url=' + encodeURI(data.url)
							,'sharer', 'toolbar=0,status=0,width=' + data.popupWidth + ',height=' + data.popupHeight);
					};

					$scope.redditShare = function manageRedditShare (data) {

						$window.open(
							'//www.reddit.com/submit?url=' + encodeURI(data.url) + '&title=' + encodeURI(data.text)
							,'sharer', 'toolbar=0,status=0,width=' + data.popupWidth + ',height=' + data.popupHeight);
					};

					$scope.stumbleuponShare = function manageStumbleuponShare (data) {

						$window.open(
							'//www.stumbleupon.com/submit?url=' + encodeURI(data.url) + '&title=' + encodeURI(data.text)
							,'sharer', 'toolbar=0,status=0,width=' + data.popupWidth + ',height=' + data.popupHeight);
					};

					$scope.linkedinShare = function manageLinkedinShare (data) {

						$window.open(
							'//www.linkedin.com/shareArticle?mini=true&url=' + encodeURI(data.url) + '&title=' + encodeURI(data.text)
							,'sharer', 'toolbar=0,status=0,width=' + data.popupWidth + ',height=' + data.popupHeight);
					};

					$scope.pinterestShare = function managePinterestShare (data) {

						$window.open(
							'//www.pinterest.com/pin/create/button/?url=' + encodeURI(data.url) + '&media=' + encodeURI(data.media) + '&description=' + encodeURI(data.text)
							,'sharer', 'toolbar=0,status=0,width=' + data.popupWidth + ',height=' + data.popupHeight);
					};

					$scope.diggShare = function manageDiggShare (data) {

						$window.open(
							'//www.digg.com/submit?url=' + encodeURI(data.url) + '&title=' + encodeURI(data.text)
							,'sharer', 'toolbar=0,status=0,width=' + data.popupWidth + ',height=' + data.popupHeight);
					};

					$scope.tumblrShare = function manageTumblrShare (data) {
						//tumblr doesnt likes http:// or https:// actually its a mistery
						$window.open(
							'//www.tumblr.com/share/link?url=' + encodeURI(data.url.replace('http://', '').replace('https://')) + '&description=' + encodeURI(data.text)
							,'sharer', 'toolbar=0,status=0,width=' + data.popupWidth + ',height=' + data.popupHeight);
					};

					$scope.vkShare = function manageVkShare (data) {

						$window.open(
							'//www.vk.com/share.php?url=' + encodeURI(data.url)
							,'sharer', 'toolbar=0,status=0,width=' + data.popupWidth + ',height=' + data.popupHeight);
					};

					$scope.deliciousShare = function manageDeliciousShare (data) {

						$window.open(
							'//www.delicious.com/save?v=5&noui&jump=close&url=' + encodeURI(data.url) + '&title=' + encodeURI(data.text)
							,'sharer', 'toolbar=0,status=0,width=' + data.popupWidth + ',height=' + data.popupHeight);
					};

					element.bind(data.eventTrigger, function onEventTriggered() {

						switch (data.provider) {
							case 'facebook':

								$scope.facebookShare(data);
								break;

							case 'google+':

								$scope.googlePlusShare(data);
								break;

							case 'twitter':

								$scope.twitterShare(data);
								break;

							case 'stumbleupon':

								$scope.stumbleuponShare(data);
								break;

							case 'reddit':

								$scope.redditShare(data);
								break;

							case 'pinterest':

								$scope.pinterestShare(data);
								break;

							case 'linkedin':

								$scope.linkedinShare(data);
								break;

							case 'digg':

								$scope.diggShare(data);
								break;

							case 'tumblr':

								$scope.tumblrShare(data);
								break;

							case 'delicious':

								$scope.deliciousShare(data);
								break;

							case 'vk':

								$scope.vkShare(data);
								break;

							default: return;
						}
					});
				}
			};
		});
}(angular));
