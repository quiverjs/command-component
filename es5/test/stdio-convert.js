"use strict";
require('traceur');
var readFileSync = $traceurRuntime.assertObject(require('fs')).readFileSync;
var async = $traceurRuntime.assertObject(require('quiver-promise')).async;
var fileStreamable = $traceurRuntime.assertObject(require('quiver-file-stream')).fileStreamable;
var streamableToText = $traceurRuntime.assertObject(require('quiver-stream-util')).streamableToText;
var loadStreamHandler = $traceurRuntime.assertObject(require('quiver-component')).loadStreamHandler;
var makeCommandHandler = $traceurRuntime.assertObject(require('../lib/command-handler.js')).makeCommandHandler;
var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
var should = chai.should();
describe('stdio convert test', (function() {
  it('basic test', async($traceurRuntime.initGeneratorFunction(function $__1() {
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
            stdioConvertHandler = makeCommandHandler(getCommandArgs, 'pipe', 'pipe');
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
    }, $__1, this);
  })));
}));
