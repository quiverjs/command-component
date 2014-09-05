"use strict";
Object.defineProperties(exports, {
  makeCommandHandler: {get: function() {
      return makeCommandHandler;
    }},
  __esModule: {value: true}
});
var $__quiver_45_error__,
    $__quiver_45_promise__,
    $__quiver_45_component__,
    $__fs__,
    $__temp__,
    $__child_95_process__,
    $__quiver_45_stream_45_util__,
    $__quiver_45_file_45_stream__,
    $__await_46_js__;
var error = ($__quiver_45_error__ = require("quiver-error"), $__quiver_45_error__ && $__quiver_45_error__.__esModule && $__quiver_45_error__ || {default: $__quiver_45_error__}).error;
var $__1 = ($__quiver_45_promise__ = require("quiver-promise"), $__quiver_45_promise__ && $__quiver_45_promise__.__esModule && $__quiver_45_promise__ || {default: $__quiver_45_promise__}),
    async = $__1.async,
    createPromise = $__1.createPromise;
var streamHandlerBuilder = ($__quiver_45_component__ = require("quiver-component"), $__quiver_45_component__ && $__quiver_45_component__.__esModule && $__quiver_45_component__ || {default: $__quiver_45_component__}).streamHandlerBuilder;
var fs = ($__fs__ = require("fs"), $__fs__ && $__fs__.__esModule && $__fs__ || {default: $__fs__}).default;
var unlink = fs.unlink;
var tempLib = ($__temp__ = require("temp"), $__temp__ && $__temp__.__esModule && $__temp__ || {default: $__temp__}).default;
var tempPath = tempLib.path;
var childProcess = ($__child_95_process__ = require("child_process"), $__child_95_process__ && $__child_95_process__.__esModule && $__child_95_process__ || {default: $__child_95_process__}).default;
var spawnProcess = childProcess.spawn;
var $__6 = ($__quiver_45_stream_45_util__ = require("quiver-stream-util"), $__quiver_45_stream_45_util__ && $__quiver_45_stream_45_util__.__esModule && $__quiver_45_stream_45_util__ || {default: $__quiver_45_stream_45_util__}),
    reuseStream = $__6.reuseStream,
    streamableToText = $__6.streamableToText,
    pipeStream = $__6.pipeStream,
    emptyStreamable = $__6.emptyStreamable,
    nodeToQuiverReadStream = $__6.nodeToQuiverReadStream,
    nodeToQuiverWriteStream = $__6.nodeToQuiverWriteStream;
var $__7 = ($__quiver_45_file_45_stream__ = require("quiver-file-stream"), $__quiver_45_file_45_stream__ && $__quiver_45_file_45_stream__.__esModule && $__quiver_45_file_45_stream__ || {default: $__quiver_45_file_45_stream__}),
    toFileStreamable = $__7.toFileStreamable,
    tempFileStreamable = $__7.tempFileStreamable;
var awaitProcess = ($__await_46_js__ = require("./await.js"), $__await_46_js__ && $__await_46_js__.__esModule && $__await_46_js__ || {default: $__await_46_js__}).awaitProcess;
var validModes = {
  'file': true,
  'pipe': true,
  'ignore': true
};
var makeCommandHandler = (function(cmdArgsExtractor, inputMode, outputMode) {
  if (typeof(cmdArgsExtractor) != 'function')
    throw new Error('command args extractor must be function');
  if (!validModes[$traceurRuntime.toProperty(inputMode)] || !validModes[$traceurRuntime.toProperty(outputMode)])
    throw new Error('invalid input/output mode');
  var inputFileMode = inputMode == 'file';
  var inputPipeMode = inputMode == 'pipe';
  var inputIgnoreMode = inputMode == 'ignore';
  var outputFileMode = outputMode == 'file';
  var outputPipeMode = outputMode == 'pipe';
  var outputIgnoreMode = outputMode == 'ignore';
  return streamHandlerBuilder((function(config) {
    var $__10;
    var $__9 = config,
        tempPathBuilder = ($__10 = $__9.tempPathBuilder) === void 0 ? tempPath : $__10,
        commandTimeout = $__9.commandTimeout;
    return async($traceurRuntime.initGeneratorFunction(function $__11(args, inputStreamable) {
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
          $__12,
          $__13,
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
              $__12 = tempPathBuilder();
              $ctx.state = 17;
              break;
            case 17:
              $ctx.state = 13;
              return $__12;
            case 13:
              $__13 = $ctx.sent;
              $ctx.state = 15;
              break;
            case 15:
              args.outputFile = $__13;
              outPath = $__13;
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
              $ctx.state = 82;
              break;
            case 82:
              $ctx.state = (inputFileMode || inputIgnoreMode) ? 31 : 25;
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
              $ctx.state = (outputFileMode) ? 48 : 79;
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
            case 79:
              $ctx.state = (outputPipeMode) ? 69 : 77;
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
            case 77:
              command.stdout.resume();
              command.stderr.resume();
              $ctx.state = 78;
              break;
            case 78:
              $ctx.state = 72;
              return awaitProcess(command, commandTimeout);
            case 72:
              $ctx.maybeThrow();
              $ctx.state = 74;
              break;
            case 74:
              $ctx.returnValue = emptyStreamable();
              $ctx.state = -2;
              break;
            case 43:
              $ctx.state = $ctx.finallyFallThrough;
              break;
            default:
              return $ctx.end();
          }
      }, $__11, this);
    }));
  }));
});
