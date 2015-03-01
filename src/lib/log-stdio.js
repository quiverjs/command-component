export let logProcessIO = (stdioLogger, childProcess, commandArgs) => {
  let logger = stdioLogger.newLog(commandArgs)

  childProcess.stdout.on('data', 
    data => logger.stdout(data))

  childProcess.stderr.on('data', 
    data => logger.stderr(data))
  
  childProcess.on('exit', 
    code => logger.exit(code))
}