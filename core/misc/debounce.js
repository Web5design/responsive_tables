/**
 * @file debounce.js
 *
 * Returns a function that will not invoked while it continues to be called,
 * until the wait period has experied without a call to the function.
 *
 * Use this function to prevent frequent calls to functions, for
 * example like event handlers attached to the resize event.
 *
 * To use debounce, pass your function to debounce as the first argument
 * and the waiting period as the second.
 *
 * If immediate is passed as true, the provided function will be invoked before
 * the wait time has elapsed instead of after, once the debounce-wrapped function
 * ceases to be called.
 */
(function (Drupal, undefined) {

"use strict";

  Drupal.debounce = function (fn, wait, immediate) {
    var timeout;
    return function () {
      var context = this;
      var args = arguments;
      var deferred = function () {
        timeout = null;
        if (!immediate) {
          fn.apply(context, args);
        }
      };
      var invoke = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(deferred, wait);
      if (invoke) {
        fn.apply(context, args);
      }
    };
  };
})(Drupal);
