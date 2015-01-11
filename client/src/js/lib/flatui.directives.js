// @see https://gist.github.com/cirqueit/b668f464a80ad5c8ca0b
(function() {
	angular.module('flatui.directives', [])
		.directive("flatuiRadio", function() {
			return {
				restrict: "AE",
				template: '<label ng-class="{\'checked\': model == value, \'disabled\': disabled}" class="radio">{{label}}<span class="icons"><span class="first-icon fui-radio-unchecked"></span><span class="second-icon fui-radio-checked"></span></span><input type="radio" ng-model="model" ng-disabled="disabled" ng-value="value" ng-required="required" name="name"/></label>',
				replace: true,
				scope: {
					model: "=",
					label: "=",
					value: "=",
					required: "=",
					name: "=",
					disabled: '@'
				},
				compile: function(element, attrs) {
					if (attrs.disabled === void 0) {
						attrs.disabled = false;
					} else {
						attrs.disabled = true;
					}
				}
			};
		})
		.directive("flatuiCheckbox", function() {
			return {
				restrict: "AE",
				template: '<label ng-class="{\'checked\': model, \'disabled\': disabled}" class="checkbox">{{label}}<span class="icons"><span class="first-icon fui-checkbox-unchecked"></span><span class="second-icon fui-checkbox-checked"></span></span><input type="checkbox" ng-model="model" ng-disabled="disabled" ng-value="value" ng-required="required" name="name"/></label>',
				replace: true,
				scope: {
					model: "=",
					label: "=",
					value: "=",
					required: "=",
					name: "=",
					disabled: "@"
				},
				compile: function(element, attrs) {
					if (attrs.disabled === void 0) {
						attrs.disabled = false;
					} else {
						attrs.disabled = true;
					}
				}
			};
		})
		.directive('flatuiSwitch', function() {
			return {
				restrict: 'AE',
				template: '<div ng-click="model = disabled && model || !disabled && !model" ng-class="{\'deactivate\': disabled, \'switch-square\': square}" class="switch has-switch"><div ng-class="{\'switch-off\': !model, \'switch-on\': model}" class="switch-animate"><span ng-bind="onLabel" class="switch-left"></span><label>&nbsp</label><span ng-bind="offLabel" class="switch-right"></span></div></div>',
				replace: true,
				scope: {
					model: '=',
					disabled: '@',
					square: '@',
					onLabel: '@',
					offLabel: '@'
				},
				compile: function(element, attrs) {
					if (attrs.onLabel === void 0) {
						attrs.onLabel = 'ON';
					}
					if (attrs.offLabel === void 0) {
						attrs.offLabel = 'OFF';
					}
					if (attrs.disabled === void 0) {
						attrs.disabled = false;
					} else {
						attrs.disabled = true;
					}
					if (attrs.square === void 0) {
						attrs.square = false;
					} else {
						attrs.square = true;
					}
				}
			};
		});
})();
