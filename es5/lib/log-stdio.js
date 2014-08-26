"use strict";
Object.defineProperties(exports, {
  logProcessIO: {get: function() {
      return logProcessIO;
    }},
  __esModule: {value: true}
});
var logProcessIO = (function(stdioLogger, childProcess, commandArgs) {
  var logger = stdioLogger.newLog(commandArgs);
  childProcess.stdout.on('data', (function(data) {
    return logger.stdout(data);
  }));
  childProcess.stderr.on('data', (function(data) {
    return logger.stderr(data);
  }));
  childProcess.on('exit', (function(code) {
    return logger.exit(code);
  }));
});
