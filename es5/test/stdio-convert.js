"use strict";
var $__traceur_64_0_46_0_46_58__,
    $__quiver_45_promise__,
    $__quiver_45_file_45_stream__,
    $__quiver_45_stream_45_util__,
    $__quiver_45_component__,
    $__fs__,
    $___46__46__47_lib_47_command_45_component_46_js__;
($__traceur_64_0_46_0_46_58__ = require("traceur"), $__traceur_64_0_46_0_46_58__ && $__traceur_64_0_46_0_46_58__.__esModule && $__traceur_64_0_46_0_46_58__ || {default: $__traceur_64_0_46_0_46_58__});
var async = ($__quiver_45_promise__ = require("quiver-promise"), $__quiver_45_promise__ && $__quiver_45_promise__.__esModule && $__quiver_45_promise__ || {default: $__quiver_45_promise__}).async;
var fileStreamable = ($__quiver_45_file_45_stream__ = require("quiver-file-stream"), $__quiver_45_file_45_stream__ && $__quiver_45_file_45_stream__.__esModule && $__quiver_45_file_45_stream__ || {default: $__quiver_45_file_45_stream__}).fileStreamable;
var streamableToText = ($__quiver_45_stream_45_util__ = require("quiver-stream-util"), $__quiver_45_stream_45_util__ && $__quiver_45_stream_45_util__.__esModule && $__quiver_45_stream_45_util__ || {default: $__quiver_45_stream_45_util__}).streamableToText;
var loadStreamHandler = ($__quiver_45_component__ = require("quiver-component"), $__quiver_45_component__ && $__quiver_45_component__.__esModule && $__quiver_45_component__ || {default: $__quiver_45_component__}).loadStreamHandler;
var fs = ($__fs__ = require("fs"), $__fs__ && $__fs__.__esModule && $__fs__ || {default: $__fs__}).default;
var readFileSync = fs.readFileSync;
var commandHandler = ($___46__46__47_lib_47_command_45_component_46_js__ = require("../lib/command-component.js"), $___46__46__47_lib_47_command_45_component_46_js__ && $___46__46__47_lib_47_command_45_component_46_js__.__esModule && $___46__46__47_lib_47_command_45_component_46_js__ || {default: $___46__46__47_lib_47_command_45_component_46_js__}).commandHandler;
var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
var should = chai.should();
describe('stdio convert test', (function() {
  it('basic test', async($traceurRuntime.initGeneratorFunction(function $__7() {
    var testFile,
        expectedFile,
        expectedResult,
        getCommandArgs,
        stdioConvertHandler,
        handler,
        streamable;
    return $traceurRuntime.createGeneratorInstance(function($ctx) {
      while (true)
        switch ($ctx.state) {
          case 0:
            testFile = './test-content/00.txt';
            expectedFile = './test-content/00-grep.txt';
            expectedResult = readFileSync(expectedFile).toString();
            getCommandArgs = (function(args) {
              return ['grep', 'IPSUM'];
            });
            stdioConvertHandler = commandHandler(getCommandArgs, 'pipe', 'pipe');
            $ctx.state = 14;
            break;
          case 14:
            $ctx.state = 2;
            return loadStreamHandler({}, stdioConvertHandler);
          case 2:
            handler = $ctx.sent;
            $ctx.state = 4;
            break;
          case 4:
            $ctx.state = 6;
            return fileStreamable(testFile);
          case 6:
            streamable = $ctx.sent;
            $ctx.state = 8;
            break;
          case 8:
            $ctx.state = 10;
            return handler({}, streamable).then(streamableToText).should.eventually.equal(expectedResult);
          case 10:
            $ctx.maybeThrow();
            $ctx.state = -2;
            break;
          default:
            return $ctx.end();
        }
    }, $__7, this);
  })));
}));
