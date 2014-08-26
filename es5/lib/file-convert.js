"use strict";
Object.defineProperties(exports, {
  fileConvertHandler: {get: function() {
      return fileConvertHandler;
    }},
  makeFileConvertHandler: {get: function() {
      return makeFileConvertHandler;
    }},
  __esModule: {value: true}
});
var unlink = $traceurRuntime.assertObject(require('fs')).unlink;
var error = $traceurRuntime.assertObject(require('quiver-error')).error;
var tempPath = $traceurRuntime.assertObject(require('temp')).path;
var $__0 = $traceurRuntime.assertObject(require('quiver-promise')),
    resolve = $__0.resolve,
    createPromise = $__0.createPromise,
    async = $__0.async;
var spawnProcess = $traceurRuntime.assertObject(require('child_process')).spawn;
var StreamHandlerBuilder = $traceurRuntime.assertObject(require('quiver-component')).StreamHandlerBuilder;
var $__0 = $traceurRuntime.assertObject(require('quiver-file-stream')),
    toFileStreamable = $__0.toFileStreamable,
    tempFileStreamable = $__0.tempFileStreamable;
var logProcessIO = $traceurRuntime.assertObject(require('./log-stdio.js')).logProcessIO;
var fileConvertHandler = new StreamHandlerBuilder((function(config) {
  var $__1;
  var $__0 = $traceurRuntime.assertObject(config),
      getCommandArgs = $__0.getCommandArgs,
      stdioLogger = $__0.stdioLogger,
      commandTimeout = $__0.commandTimeout,
      getTempPath = ($__1 = $__0.getTempPath) === void 0 ? tempPath : $__1;
  var runCommand = (function(commandArgs) {
    return createPromise((function(resolve, reject) {
      var command = spawnProcess(commandArgs[0], commandArgs.slice(1));
      if (stdioLogger)
        logProcessIO(stdioLogger, command, commandArgs);
      command.stdin.end();
      command.stdout.resume();
      command.stderr.resume();
      var processExited = false;
      command.on('exit', (function(code) {
        if (processExited)
          return;
        processExited = true;
        if (code != 0)
          return reject(error(500, 'child process exited with error code ' + code));
        resolve();
      }));
      if (commandTimeout) {
        setTimeout((function() {
          if (processExited)
            return;
          processExited = true;
          command.kill();
          reject(error(500, 'child process timeout'));
        }), commandTimeout);
      }
    }));
  });
  return async($traceurRuntime.initGeneratorFunction(function $__2(args, inputStreamable) {
    var streamable,
        inputIsTemp,
        inPath,
        outPath,
        commandArgs;
    return $traceurRuntime.createGeneratorInstance(function($ctx) {
      while (true)
        switch ($ctx.state) {
          case 0:
            $ctx.state = 2;
            return toFileStreamable(inputStreamable);
          case 2:
            streamable = $ctx.sent;
            $ctx.state = 4;
            break;
          case 4:
            inputIsTemp = streamable.tempFile;
            $ctx.state = 32;
            break;
          case 32:
            $ctx.state = 6;
            return streamable.toFilePath();
          case 6:
            inPath = $ctx.sent;
            $ctx.state = 8;
            break;
          case 8:
            $ctx.state = 10;
            return getTempPath();
          case 10:
            outPath = $ctx.sent;
            $ctx.state = 12;
            break;
          case 12:
            $ctx.state = 14;
            return getCommandArgs(args, inPath, outPath);
          case 14:
            commandArgs = $ctx.sent;
            $ctx.state = 16;
            break;
          case 16:
            $ctx.pushTry(null, 22);
            $ctx.state = 24;
            break;
          case 24:
            $ctx.state = 18;
            return runCommand(commandArgs);
          case 18:
            $ctx.maybeThrow();
            $ctx.state = 22;
            $ctx.finallyFallThrough = 20;
            break;
          case 22:
            $ctx.popTry();
            $ctx.state = 28;
            break;
          case 28:
            if (inputIsTemp)
              unlink(inPath, (function() {}));
            $ctx.state = 26;
            break;
          case 20:
            $ctx.returnValue = tempFileStreamable(outPath);
            $ctx.state = -2;
            break;
          case 26:
            $ctx.state = $ctx.finallyFallThrough;
            break;
          default:
            return $ctx.end();
        }
    }, $__2, this);
  }));
}), {name: 'Quier File Convert Command Handler'});
var makeFileConvertHandler = fileConvertHandler.privatizedConstructor();
