"use strict";
Object.defineProperties(exports, {
  awaitProcess: {get: function() {
      return awaitProcess;
    }},
  __esModule: {value: true}
});
var error = $traceurRuntime.assertObject(require('quiver-error')).error;
var createPromise = $traceurRuntime.assertObject(require('quiver-promise')).createPromise;
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
