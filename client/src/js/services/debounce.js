angular.module('gokibitz.services').factory('debounce', [
	'$timeout',
	function ($timeout) {
		return function (wait, fn) {
			var args, context, result, timeout;
			// Execute the callback function
			function ping() {
				result = fn.apply(context, args);
				context = args = null;
			}
			// Cancel the timeout (for rescheduling afterwards).
			function cancel() {
				if (timeout) {
					$timeout.cancel(timeout);
					timeout = null;
				}
			}
			// This is the actual result of the debounce call. It is a
			// wrapper function which you can invoke multiple times and
			// which will only be called once every "wait" milliseconds.
			function wrapper() {
				context = this;
				args = arguments;
				cancel();
				timeout = $timeout(ping, wait);
			}
			// The wrapper also has a flush method, which you can use to
			// force the execution of the last scheduled call to happen
			// immediately (if any). It will also return the result of that
			// call. Note that for asynchronous operations, you'll need to
			// return a promise and wait for that one to resolve.
			wrapper.flush = function () {
				if (context) {
					// Call pending, do it now.
					cancel();
					ping();
				} else if (!timeout) {
					// Never been called.
					ping();
				}
				return result;
			};
			return wrapper;
		};
	}
]);
