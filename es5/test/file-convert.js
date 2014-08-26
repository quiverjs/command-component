"use strict";
require('traceur');
var readFileSync = $traceurRuntime.assertObject(require('fs')).readFileSync;
var async = $traceurRuntime.assertObject(require('quiver-promise')).async;
var fileStreamable = $traceurRuntime.assertObject(require('quiver-file-stream')).fileStreamable;
var streamableToText = $traceurRuntime.assertObject(require('quiver-stream-util')).streamableToText;
var makeFileConvertHandler = $traceurRuntime.assertObject(require('../lib/file-convert.js')).makeFileConvertHandler;
var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
var should = chai.should();
describe('file convert handler test', (function() {
  it('basic test', async($traceurRuntime.initGeneratorFunction(function $__1() {
    var testFile,
        expectedFile,
        expectedResult,
        getCommandArgs,
        getTempPath,
        config,
        fileConvertHandler,
        handler,
        streamable;
    return $traceurRuntime.createGeneratorInstance(function($ctx) {
      while (true)
        switch ($ctx.state) {
          case 0:
            testFile = './test-content/00.txt';
            expectedFile = './test-content/00-ucase.txt';
            expectedResult = readFileSync(expectedFile).toString();
            getCommandArgs = (function(args, inPath, outPath) {
              return ['dd', 'if=' + inPath, 'of=' + outPath, 'conv=ucase'];
            });
            getTempPath = (function() {
              return './test-content/temp/' + (new Date()).getTime() + '-' + (Math.random() * 10000 | 0) + '.tmp';
            });
            config = {
              getCommandArgs: getCommandArgs,
              getTempPath: getTempPath
            };
            fileConvertHandler = makeFileConvertHandler();
            $ctx.state = 14;
            break;
          case 14:
            $ctx.state = 2;
            return fileConvertHandler.loadHandler(config);
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
