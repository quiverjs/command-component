"use strict";
Object.defineProperties(exports, {
  fileConvertHandler: {get: function() {
      return fileConvertHandler;
    }},
  __esModule: {value: true}
});
var error = $traceurRuntime.assertObject(require('quiver-error')).error;
var unlink = $traceurRuntime.assertObject(require('fs')).unlink;
var tempPath = $traceurRuntime.assertObject(require('temp')).path;
var $__0 = $traceurRuntime.assertObject(require('quiver-promise')),
    resolve = $__0.resolve,
    promisify = $__0.promisify;
var spawnProcess = $traceurRuntime.assertObject(require('child_process')).spawn;
var StreamHandlerBuilder = $traceurRuntime.assertObject(require('quiver-component')).StreamHandlerBuilder;
var $__0 = $traceurRuntime.assertObject(require('quiver-file-stream')),
    toFileStreamable = $__0.toFileStreamable,
    tempFileStreamable = $__0.tempFileStreamable;
var fileConvertHandler = new StreamHandlerBuilder((function(config) {
  var $__1;
  var $__0 = $traceurRuntime.assertObject(config),
      getCommandArgs = $__0.getCommandArgs,
      stdioLogger = $__0.stdioLogger,
      commandTimeout = $__0.commandTimeout,
      getTempPath = ($__1 = $__0.getTempPath) === void 0 ? tempPath : $__1;
  var getFilePaths = (function(inputStreamable) {
    return Promise.all([toFileStreamable(inputStreamable, getTempPath), getTempPath()]).then((function($__0) {
      var inputStreamable = $__0[0],
          outPath = $__0[1];
      var inputIsTemp = inputStreamable.tempFile;
      return inputStreamable.toFilePath().then((function(inPath) {
        return ({
          inPath: inPath,
          outPath: outPath,
          inputIsTemp: inputIsTemp
        });
      }));
    }));
  });
  var runCommand = promisify((function(commandArgs, callback) {
    var command = spawnProcess(commandArgs[0], commandArgs.slice(1));
    command.stdin.end();
    command.stdout.resume();
    command.stderr.resume();
    var processExited = false;
    command.on('exit', (function(code) {
      if (processExited)
        return;
      processExited = true;
      if (code != 0)
        return callback(error(500, 'child process exited with error code ' + code));
      callback(null);
    }));
    if (commandTimeout) {
      setTimeout((function() {
        if (processExited)
          return;
        processExited = true;
        command.kill();
        callback(error(500, 'child process timeout'));
      }), commandTimeout);
    }
  }));
  var runWithFile = (function(args, inPath, outPath) {
    return resolve(getCommandArgs(args, inPath, outPath)).then(runCommand);
  });
  return (function(args, inputStreamable) {
    return getFilePaths(inputStreamable).then((function($__0) {
      var inPath = $__0.inPath,
          outPath = $__0.outPath,
          inputIsTemp = $__0.inputIsTemp;
      return runWithFile(args, inPath, outPath).then((function() {
        if (inputIsTemp)
          unlink(inPath, (function() {}));
        return tempFileStreamable(outPath);
      }));
    }));
  });
}), {name: 'Quier File Convert Command Handler'});
