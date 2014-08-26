import { error } from 'quiver-error'
import { resolve, createPromise, async } from 'quiver-promise'
import { spawn as spawnProcess } from 'child_process'
import { SimpleHandlerBuilder } from 'quiver-component'
import { 
  reuseStream, streamableToText, pipeStream,
  nodeToQuiverReadStream, nodeToQuiverWriteStream 
} from 'quiver-stream-util'

import { logProcessIO } from './log-stdio.js'

export var stdioConvertHandler = new SimpleHandlerBuilder(
config => {
  var {
    getCommandArgs,
    stdioLogger,
    commandTimeout,
    streamingResult=false
  } = config

  var runCommand = (commandArgs, inputStream) => 
  createPromise((resolve, reject) => {
    var resolved = false
    var command = spawnProcess(commandArgs[0], commandArgs.slice(1))

    var stdinStream = nodeToQuiverWriteStream(command.stdin)

    var stdoutStreamable = reuseStream(
      nodeToQuiverReadStream(command.stdout))

    var stderrStreamable = reuseStream(
      nodeToQuiverReadStream(command.stderr))

    pipeStream(inputStream, stdinStream)

    if(stdioLogger) logProcessIO(stdioLogger, command, commandArgs)

    command.on('exit', code => {
      if(resolved) return
      resolved = true

      if(code == 0) {
        resolve(stdoutStreamable)
      } else {
        streamableToText(stderrStreamable)
        .then(message =>
          reject(error(500, 'error executing command: ' + message)), 
          reject)
      }
    })

    if(commandTimeout) {
      setTimeout(() => {
        command.kill()

        if(resolved) return
        resolved = true

        reject(error(500, 'child process timeout'))
      }, commandTimeout)
    }

    if(streamingResult && !resolved) {
      resolved = true
      resolve(stdoutStreamable)
    }
  })

  return async(function*(args, inputStream) {
    var commandArgs = yield getCommandArgs(args)

    return runCommand(commandArgs, inputStream)
  })

}, 'stream', 'streamable', {
  name: 'Quiver STDIO Convert Command Handler'
})

export var makeStdioConvertHandler = 
  stdioConvertHandler.privatizedConstructor()