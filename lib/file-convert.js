import { error } from 'quiver-error'
import { unlink } from 'fs'
import { path as tempPath } from 'temp'
import { resolve, promisify } from 'quiver-promise'
import { spawn as spawnProcess } from 'child_process'
import { StreamHandlerBuilder } from 'quiver-component'
import { 
  toFileStreamable, tempFileStreamable 
} from 'quiver-file-stream'

export var fileConvertHandler = new StreamHandlerBuilder(
config => {
  var {
    getCommandArgs,
    stdioLogger,
    commandTimeout,
    getTempPath=tempPath
  } = config

  var getFilePaths = inputStreamable =>
    Promise.all([
      toFileStreamable(inputStreamable, getTempPath),
      getTempPath()
    ]).then(([inputStreamable, outPath]) => {
      var inputIsTemp = inputStreamable.tempFile

      return inputStreamable.toFilePath()
      .then(inPath => ({
        inPath, outPath, inputIsTemp
      }))
    })

  var runCommand = promisify((commandArgs, callback) => {
    var command = spawnProcess(commandArgs[0], commandArgs.slice(1))

    // make sure the stdio streams are resumed/closed
    // so that the child process do not hang waiting 
    // from these streams.
    command.stdin.end()
    command.stdout.resume()
    command.stderr.resume()

    var processExited = false

    command.on('exit', code => {
      if(processExited) return

      processExited = true
      if(code != 0) return callback(error(500, 
        'child process exited with error code ' + code))
      
      callback(null)
    })

    if(commandTimeout) {
      setTimeout(() => {
        if(processExited) return

        processExited = true
        command.kill()

        callback(error(500, 'child process timeout'))
        
      }, commandTimeout)
    }
  })

  var runWithFile = (args, inPath, outPath) =>
    resolve(getCommandArgs(args, inPath, outPath))
      .then(runCommand)

  return (args, inputStreamable) => 
    getFilePaths(inputStreamable)
    .then(({inPath, outPath, inputIsTemp}) =>
      runWithFile(args, inPath, outPath).then(() => {
        if(inputIsTemp) unlink(inPath, ()=>{})

        return tempFileStreamable(outPath)
      }))
      
}, {
  name: 'Quier File Convert Command Handler'
})