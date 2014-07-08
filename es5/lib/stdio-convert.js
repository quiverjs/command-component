"use strict";
Object.defineProperties(exports, {
  stdioConvertHandler: {get: function() {
      return stdioConvertHandler;
    }},
  __esModule: {value: true}
});
var error = $traceurRuntime.assertObject(require('quiver-error')).error;
var $__0 = $traceurRuntime.assertObject(require('quiver-promise')),
    resolve = $__0.resolve,
    promisify = $__0.promisify;
var spawnProcess = $traceurRuntime.assertObject(require('child_process')).spawn;
var SimpleHandlerBuilder = $traceurRuntime.assertObject(require('quiver-component')).SimpleHandlerBuilder;
var $__0 = $traceurRuntime.assertObject(require('quiver-stream-util')),
    reuseStream = $__0.reuseStream,
    streamableToText = $__0.streamableToText,
    pipeStream = $__0.pipeStream,
    nodeToQuiverReadStream = $__0.nodeToQuiverReadStream,
    nodeToQuiverWriteStream = $__0.nodeToQuiverWriteStream;
var stdioConvertHandler = new SimpleHandlerBuilder((function(config) {
  var $__1;
  var $__0 = $traceurRuntime.assertObject(config),
      getCommandArgs = $__0.getCommandArgs,
      stdioLogger = $__0.stdioLogger,
      commandTimeout = $__0.commandTimeout,
      streamingResult = ($__1 = $__0.streamingResult) === void 0 ? false : $__1;
  var runCommand = promisify((function(commandArgs, inputStream, callback) {
    var callbackCalled = false;
    var command = spawnProcess(commandArgs[0], commandArgs.slice(1));
    var stdinStream = nodeToQuiverWriteStream(command.stdin);
    var stdoutStreamable = reuseStream(nodeToQuiverReadStream(command.stdout));
    var stderrStreamable = reuseStream(nodeToQuiverReadStream(command.stderr));
    pipeStream(inputStream, stdinStream);
    command.on('exit', (function(code) {
      if (callbackCalled)
        return;
      callbackCalled = true;
      if (code == 0) {
        callback(null, stdoutStreamable);
      } else {
        streamableToText(stderrStreamable).then((function(message) {
          return callback(error(500, 'error executing command: ' + message));
        }), callback);
      }
    }));
    if (commandTimeout) {
      setTimeout((function() {
        command.kill();
        if (callbackCalled)
          return;
        callbackCalled = true;
        callback(error(500, 'child process timeout'));
      }), commandTimeout);
    }
    if (streamingResult && !callbackCalled) {
      callbackCalled = true;
      callback(null, stdoutStreamable);
    }
  }));
  return (function(args, inputStream) {
    return resolve(getCommandArgs(args)).then((function(commandArgs) {
      return runCommand(commandArgs, inputStream);
    }));
  });
}), 'stream', 'streamable', {name: 'Quiver STDIO Convert Command Handler'});
