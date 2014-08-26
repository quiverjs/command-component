"use strict";
Object.defineProperties(exports, {
  makeCommandHandler: {get: function() {
      return makeCommandHandler;
    }},
  __esModule: {value: true}
});
var makeCommandHandler = (function(cmdArgsExtractor, inputMode, outputMode) {
  return streamHandlerBuilder((function(config) {
    return async($traceurRuntime.initGeneratorFunction(function $__0(args, streamable) {
      return $traceurRuntime.createGeneratorInstance(function($ctx) {
        while (true)
          switch ($ctx.state) {
            case 0:
              $ctx.state = -2;
              break;
            default:
              return $ctx.end();
          }
      }, $__0, this);
    }));
  }));
});
