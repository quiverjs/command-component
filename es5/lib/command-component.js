"use strict";
Object.defineProperties(exports, {
  fileConvertHandler: {get: function() {
      return fileConvertHandler;
    }},
  stdioConvertHandler: {get: function() {
      return stdioConvertHandler;
    }},
  __esModule: {value: true}
});
var fileConvertHandler = $traceurRuntime.assertObject(require('./file-convert.js')).fileConvertHandler;
var stdioConvertHandler = $traceurRuntime.assertObject(require('./stdio-convert.js')).stdioConvertHandler;
;
