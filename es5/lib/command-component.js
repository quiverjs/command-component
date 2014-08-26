"use strict";
Object.defineProperties(exports, {
  makeFileConvertHandler: {get: function() {
      return makeFileConvertHandler;
    }},
  makeStdioConvertHandler: {get: function() {
      return makeStdioConvertHandler;
    }},
  __esModule: {value: true}
});
var makeFileConvertHandler = $traceurRuntime.assertObject(require('./file-convert.js')).makeFileConvertHandler;
var makeStdioConvertHandler = $traceurRuntime.assertObject(require('./stdio-convert.js')).makeStdioConvertHandler;
;
