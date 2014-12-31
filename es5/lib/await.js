"use strict";
Object.defineProperties(exports, {
  awaitProcess: {get: function() {
      return awaitProcess;
    }},
  __esModule: {value: true}
});
var $__quiver_45_core_47_error__,
    $__quiver_45_core_47_promise__;
var error = ($__quiver_45_core_47_error__ = require("quiver-core/error"), $__quiver_45_core_47_error__ && $__quiver_45_core_47_error__.__esModule && $__quiver_45_core_47_error__ || {default: $__quiver_45_core_47_error__}).error;
var createPromise = ($__quiver_45_core_47_promise__ = require("quiver-core/promise"), $__quiver_45_core_47_promise__ && $__quiver_45_core_47_promise__.__esModule && $__quiver_45_core_47_promise__ || {default: $__quiver_45_core_47_promise__}).createPromise;
var awaitProcess = (function(process) {
  var timeout = arguments[1] !== (void 0) ? arguments[1] : -1;
  return createPromise((function(resolve, reject) {
    var processExited = false;
    process.on('exit', (function(code) {
      if (processExited)
        return;
      processExited = true;
      if (code != 0)
        return reject(error(500, 'child process exited with error code ' + code));
      resolve();
    }));
    if (timeout > 0) {
      setTimeout((function() {
        if (processExited)
          return;
        processExited = true;
        process.kill();
        reject(error(500, 'child process timeout'));
      }), timeout);
    }
  }));
});
