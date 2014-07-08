"use strict";
require('traceur');
var readFileSync = $traceurRuntime.assertObject(require('fs')).readFileSync;
var fileStreamable = $traceurRuntime.assertObject(require('quiver-file-stream')).fileStreamable;
var streamableToText = $traceurRuntime.assertObject(require('quiver-stream-util')).streamableToText;
var fileConvertHandler = $traceurRuntime.assertObject(require('../lib/file-convert.js')).fileConvertHandler;
var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
var should = chai.should();
describe('file convert handler test', (function() {
  it('basic test', (function() {
    var testFile = './test-content/00.txt';
    var expectedFile = './test-content/00-ucase.txt';
    var expectedResult = readFileSync(expectedFile).toString();
    var getCommandArgs = (function(args, inPath, outPath) {
      return ['dd', 'if=' + inPath, 'of=' + outPath, 'conv=ucase'];
    });
    var getTempPath = (function() {
      return './test-content/temp/' + (new Date()).getTime() + '-' + (Math.random() * 10000 | 0) + '.tmp';
    });
    var config = {
      getCommandArgs: getCommandArgs,
      getTempPath: getTempPath
    };
    return Promise.all([fileConvertHandler.loadHandler(config), fileStreamable(testFile)]).then((function($__0) {
      var handler = $__0[0],
          inputStreamable = $__0[1];
      return handler({}, inputStreamable).then(streamableToText).then((function(result) {
        result.should.equal(expectedResult);
      }));
    }));
  }));
}));
