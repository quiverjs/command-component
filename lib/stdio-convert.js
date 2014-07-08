import { error } from 'quiver-error'
import { resolve, promisify } from 'quiver-promise'
import { spawn as spawnProcess } from 'child_process'
import { SimpleHandlerBuilder } from 'quiver-component'
import { 
  reuseStream, streamableToText, pipeStream,
  nodeToQuiverReadStream, nodeToQuiverWriteStream 
} from 'quiver-stream-util'

export var stdioConvertHandler = new SimpleHandlerBuilder(
config => {
  var {
    getCommandArgs,
    stdioLogger,
    commandTimeout,
    streamingResult=false
  } = config

  var runCommand = promisify((commandArgs, inputStream, callback) => {
    var callbackCalled = false
    var command = spawnProcess(commandArgs[0], commandArgs.slice(1))

    var stdinStream = nodeToQuiverWriteStream(command.stdin)

    var stdoutStreamable = reuseStream(
      nodeToQuiverReadStream(command.stdout))

    var stderrStreamable = reuseStream(
      nodeToQuiverReadStream(command.stderr))

    pipeStream(inputStream, stdinStream)

    command.on('exit', code => {
      if(callbackCalled) return
      callbackCalled = true

      if(code == 0) {
        callback(null, stdoutStreamable)
      } else {
        streamableToText(stderrStreamable)
        .then(message =>
          callback(error(500, 'error executing command: ' + message)), 
          callback)
      }
    })

    if(commandTimeout) {
      setTimeout(() => {
        command.kill()

        if(callbackCalled) return
        callbackCalled = true

        callback(error(500, 'child process timeout'))
      }, commandTimeout)
    }

    if(streamingResult && !callbackCalled) {
      callbackCalled = true
      callback(null, stdoutStreamable)
    }
  })

  return (args, inputStream) =>
    resolve(getCommandArgs(args)).then(commandArgs =>
      runCommand(commandArgs, inputStream))

}, 'stream', 'streamable', {
  name: 'Quiver STDIO Convert Command Handler'
})