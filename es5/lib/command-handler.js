"use strict";
Object.defineProperties(exports, {
  makeCommandHandler: {get: function() {
      return makeCommandHandler;
    }},
  __esModule: {value: true}
});
var unlink = $traceurRuntime.assertObject(require('fs')).unlink;
var error = $traceurRuntime.assertObject(require('quiver-error')).error;
var tempPath = $traceurRuntime.assertObject(require('temp')).path;
var $__0 = $traceurRuntime.assertObject(require('quiver-promise')),
    async = $__0.async,
    createPromise = $__0.createPromise;
var spawnProcess = $traceurRuntime.assertObject(require('child_process')).spawn;
var streamHandlerBuilder = $traceurRuntime.assertObject(require('quiver-component')).streamHandlerBuilder;
var $__0 = $traceurRuntime.assertObject(require('quiver-stream-util')),
    reuseStream = $__0.reuseStream,
    streamableToText = $__0.streamableToText,
    pipeStream = $__0.pipeStream,
    nodeToQuiverReadStream = $__0.nodeToQuiverReadStream,
    nodeToQuiverWriteStream = $__0.nodeToQuiverWriteStream;
var $__0 = $traceurRuntime.assertObject(require('quiver-file-stream')),
    toFileStreamable = $__0.toFileStreamable,
    tempFileStreamable = $__0.tempFileStreamable;
var awaitProcess = $traceurRuntime.assertObject(require('./await.js')).awaitProcess;
var validModes = {
  'file': true,
  'pipe': true
};
var makeCommandHandler = (function(cmdArgsExtractor, inputMode, outputMode) {
  if (typeof(cmdArgsExtractor) != 'function')
    throw new Error('command args extractor must be function');
  if (!validModes[$traceurRuntime.toProperty(inputMode)] || !validModes[$traceurRuntime.toProperty(outputMode)])
    throw new Error('invalid input/output mode');
  var inputFileMode = inputMode == 'file';
  var outputFileMode = outputMode == 'file';
  return streamHandlerBuilder((function(config) {
    var $__1;
    var $__0 = $traceurRuntime.assertObject(config),
        tempPathBuilder = ($__1 = $__0.tempPathBuilder) === void 0 ? tempPath : $__1,
        commandTimeout = $__0.commandTimeout;
    return async($traceurRuntime.initGeneratorFunction(function $__2(args, inputStreamable) {
      var fileStreamable,
          inputIsTemp,
          outPath,
          commandArgs,
          command,
          inputStream,
          stdinStream,
          stdoutStreamable,
          stderrStreamable,
          message,
          $__3,
          $__4,
          err;
      return $traceurRuntime.createGeneratorInstance(function($ctx) {
        while (true)
          switch ($ctx.state) {
            case 0:
              $ctx.state = (inputFileMode) ? 1 : 8;
              break;
            case 1:
              $ctx.state = 2;
              return toFileStreamable(inputStreamable, tempPathBuilder);
            case 2:
              fileStreamable = $ctx.sent;
              $ctx.state = 4;
              break;
            case 4:
              inputIsTemp = fileStreamable.tempFile;
              $ctx.state = 10;
              break;
            case 10:
              $ctx.state = 6;
              return fileStreamable.toFilePath();
            case 6:
              args.inputFile = $ctx.sent;
              $ctx.state = 8;
              break;
            case 8:
              $ctx.state = (outputFileMode) ? 16 : 19;
              break;
            case 16:
              $__3 = tempPathBuilder();
              $ctx.state = 17;
              break;
            case 17:
              $ctx.state = 13;
              return $__3;
            case 13:
              $__4 = $ctx.sent;
              $ctx.state = 15;
              break;
            case 15:
              args.outputFile = $__4;
              outPath = $__4;
              $ctx.state = 19;
              break;
            case 19:
              $ctx.state = 22;
              return cmdArgsExtractor(args);
            case 22:
              commandArgs = $ctx.sent;
              $ctx.state = 24;
              break;
            case 24:
              command = spawnProcess(commandArgs[0], commandArgs.slice(1));
              $ctx.state = 73;
              break;
            case 73:
              $ctx.state = (inputFileMode) ? 31 : 25;
              break;
            case 31:
              command.stdin.end();
              $ctx.state = 32;
              break;
            case 25:
              $ctx.state = 26;
              return inputStreamable.toStream();
            case 26:
              inputStream = $ctx.sent;
              $ctx.state = 28;
              break;
            case 28:
              stdinStream = nodeToQuiverWriteStream(command.stdin);
              pipeStream(inputStream, stdinStream);
              $ctx.state = 32;
              break;
            case 32:
              $ctx.state = (outputFileMode) ? 48 : 69;
              break;
            case 48:
              command.stdout.resume();
              command.stderr.resume();
              $ctx.state = 49;
              break;
            case 49:
              $ctx.pushTry(null, 39);
              $ctx.state = 41;
              break;
            case 41:
              $ctx.state = 35;
              return awaitProcess(command, commandTimeout);
            case 35:
              $ctx.maybeThrow();
              $ctx.state = 39;
              $ctx.finallyFallThrough = 37;
              break;
            case 39:
              $ctx.popTry();
              $ctx.state = 45;
              break;
            case 45:
              if (inputIsTemp)
                unlink(inPath, (function() {}));
              $ctx.state = 43;
              break;
            case 37:
              $ctx.returnValue = tempFileStreamable(outPath);
              $ctx.state = -2;
              break;
            case 69:
              stdoutStreamable = reuseStream(nodeToQuiverReadStream(command.stdout));
              stderrStreamable = reuseStream(nodeToQuiverReadStream(command.stderr));
              $ctx.state = 70;
              break;
            case 70:
              $ctx.pushTry(60, null);
              $ctx.state = 63;
              break;
            case 63:
              $ctx.state = 51;
              return awaitProcess(command, commandTimeout);
            case 51:
              $ctx.maybeThrow();
              $ctx.state = 53;
              break;
            case 53:
              $ctx.popTry();
              $ctx.state = 65;
              break;
            case 60:
              $ctx.popTry();
              err = $ctx.storedException;
              $ctx.state = 54;
              break;
            case 54:
              $ctx.state = 55;
              return streamableToText(stderrStreamable);
            case 55:
              message = $ctx.sent;
              $ctx.state = 57;
              break;
            case 57:
              throw error(500, 'error executing command: ' + message);
              $ctx.state = 65;
              break;
            case 65:
              $ctx.returnValue = stdoutStreamable;
              $ctx.state = -2;
              break;
            case 43:
              $ctx.state = $ctx.finallyFallThrough;
              break;
            default:
              return $ctx.end();
          }
      }, $__2, this);
    }));
  }));
});
