"use strict";
'use strict';
var logProcessIO = function(stdioLogger, childProcess, commandArgs) {
  var logger = stdioLogger.newLog(commandArgs);
  childProcess.stdout.on('data', function(data) {
    logger.stdout(data);
  });
  childProcess.stderr.on('data', function(data) {
    logger.stderr(data);
  });
  childProcess.on('exit', function(code) {
    logger.exit(code);
  });
};
module.exports = {logProcessIO: logProcessIO};
