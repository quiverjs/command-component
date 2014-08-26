import { unlink } from 'fs'
import { error } from 'quiver-error'
import { path as tempPath } from 'temp'
import { resolve, createPromise, async } from 'quiver-promise'
import { spawn as spawnProcess } from 'child_process'
import { StreamHandlerBuilder } from 'quiver-component'
import { 
  toFileStreamable, tempFileStreamable 
} from 'quiver-file-stream'

import { logProcessIO } from './log-stdio.js'

export var fileConvertHandler = new StreamHandlerBuilder(
config => {
  var {
    getCommandArgs,
    stdioLogger,
    commandTimeout,
    getTempPath=tempPath
  } = config

  var runCommand = commandArgs =>
  createPromise((resolve, reject) => {
    var command = spawnProcess(commandArgs[0], commandArgs.slice(1))

    if(stdioLogger) logProcessIO(stdioLogger, command, commandArgs)

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
      if(code != 0) return reject(error(500, 
        'child process exited with error code ' + code))
      
      resolve()
    })

    if(commandTimeout) {
      setTimeout(() => {
        if(processExited) return

        processExited = true
        command.kill()

        reject(error(500, 'child process timeout'))
        
      }, commandTimeout)
    }
  })

  return async(function*(args, inputStreamable) {
    var streamable = yield toFileStreamable(inputStreamable)

    var inputIsTemp = streamable.tempFile
    var inPath = yield streamable.toFilePath()
    var outPath = yield getTempPath()

    var commandArgs = yield getCommandArgs(
      args, inPath, outPath)

    try {
      yield runCommand(commandArgs)
    } finally {
      if(inputIsTemp) unlink(inPath, ()=>{})
    }

    return tempFileStreamable(outPath)
  })
      
}, {
  name: 'Quier File Convert Command Handler'
})

export var makeFileConvertHandler = 
  fileConvertHandler.privatizedConstructor()