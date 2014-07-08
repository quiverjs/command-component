"use strict";
require('traceur');
var readFileSync = $traceurRuntime.assertObject(require('fs')).readFileSync;
var fileStreamable = $traceurRuntime.assertObject(require('quiver-file-stream')).fileStreamable;
var streamableToText = $traceurRuntime.assertObject(require('quiver-stream-util')).streamableToText;
var loadStreamHandler = $traceurRuntime.assertObject(require('quiver-component')).loadStreamHandler;
var stdioConvertHandler = $traceurRuntime.assertObject(require('../lib/stdio-convert.js')).stdioConvertHandler;
var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
var should = chai.should();
describe('stdio convert test', (function() {
  it('basic test', (function() {
    var testFile = './test-content/00.txt';
    var expectedFile = './test-content/00-grep.txt';
    var expectedResult = readFileSync(expectedFile).toString();
    var getCommandArgs = (function(args) {
      return ['grep', 'IPSUM'];
    });
    var config = {getCommandArgs: getCommandArgs};
    return Promise.all([loadStreamHandler(config, stdioConvertHandler), fileStreamable(testFile)]).then((function($__0) {
      var handler = $__0[0],
          inputStreamable = $__0[1];
      return handler({}, inputStreamable).then(streamableToText).then((function(result) {
        result.should.equal(expectedResult);
      }));
    }));
  }));
}));
