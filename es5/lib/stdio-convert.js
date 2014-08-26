"use strict";
Object.defineProperties(exports, {
  stdioConvertHandler: {get: function() {
      return stdioConvertHandler;
    }},
  makeStdioConvertHandler: {get: function() {
      return makeStdioConvertHandler;
    }},
  __esModule: {value: true}
});
var error = $traceurRuntime.assertObject(require('quiver-error')).error;
var $__0 = $traceurRuntime.assertObject(require('quiver-promise')),
    resolve = $__0.resolve,
    createPromise = $__0.createPromise,
    async = $__0.async;
var spawnProcess = $traceurRuntime.assertObject(require('child_process')).spawn;
var SimpleHandlerBuilder = $traceurRuntime.assertObject(require('quiver-component')).SimpleHandlerBuilder;
var $__0 = $traceurRuntime.assertObject(require('quiver-stream-util')),
    reuseStream = $__0.reuseStream,
    streamableToText = $__0.streamableToText,
    pipeStream = $__0.pipeStream,
    nodeToQuiverReadStream = $__0.nodeToQuiverReadStream,
    nodeToQuiverWriteStream = $__0.nodeToQuiverWriteStream;
var logProcessIO = $traceurRuntime.assertObject(require('./log-stdio.js')).logProcessIO;
var stdioConvertHandler = new SimpleHandlerBuilder((function(config) {
  var $__1;
  var $__0 = $traceurRuntime.assertObject(config),
      getCommandArgs = $__0.getCommandArgs,
      stdioLogger = $__0.stdioLogger,
      commandTimeout = $__0.commandTimeout,
      streamingResult = ($__1 = $__0.streamingResult) === void 0 ? false : $__1;
  var runCommand = (function(commandArgs, inputStream) {
    return createPromise((function(resolve, reject) {
      var resolved = false;
      var command = spawnProcess(commandArgs[0], commandArgs.slice(1));
      var stdinStream = nodeToQuiverWriteStream(command.stdin);
      var stdoutStreamable = reuseStream(nodeToQuiverReadStream(command.stdout));
      var stderrStreamable = reuseStream(nodeToQuiverReadStream(command.stderr));
      pipeStream(inputStream, stdinStream);
      if (stdioLogger)
        logProcessIO(stdioLogger, command, commandArgs);
      command.on('exit', (function(code) {
        if (resolved)
          return;
        resolved = true;
        if (code == 0) {
          resolve(stdoutStreamable);
        } else {
          streamableToText(stderrStreamable).then((function(message) {
            return reject(error(500, 'error executing command: ' + message));
          }), reject);
        }
      }));
      if (commandTimeout) {
        setTimeout((function() {
          command.kill();
          if (resolved)
            return;
          resolved = true;
          reject(error(500, 'child process timeout'));
        }), commandTimeout);
      }
      if (streamingResult && !resolved) {
        resolved = true;
        resolve(stdoutStreamable);
      }
    }));
  });
  return async($traceurRuntime.initGeneratorFunction(function $__2(args, inputStream) {
    var commandArgs;
    return $traceurRuntime.createGeneratorInstance(function($ctx) {
      while (true)
        switch ($ctx.state) {
          case 0:
            $ctx.state = 2;
            return getCommandArgs(args);
          case 2:
            commandArgs = $ctx.sent;
            $ctx.state = 4;
            break;
          case 4:
            $ctx.returnValue = runCommand(commandArgs, inputStream);
            $ctx.state = -2;
            break;
          default:
            return $ctx.end();
        }
    }, $__2, this);
  }));
}), 'stream', 'streamable', {name: 'Quiver STDIO Convert Command Handler'});
var makeStdioConvertHandler = stdioConvertHandler.privatizedConstructor();
