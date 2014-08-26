import { unlink } from 'fs'
import { error } from 'quiver-error'
import { path as tempPath } from 'temp'
import { async, createPromise } from 'quiver-promise'
import { spawn as spawnProcess } from 'child_process'
import { streamHandlerBuilder } from 'quiver-component'

import { 
  reuseStream, streamableToText, pipeStream,
  nodeToQuiverReadStream, nodeToQuiverWriteStream 
} from 'quiver-stream-util'

import { 
  toFileStreamable, tempFileStreamable 
} from 'quiver-file-stream'

import { awaitProcess } from './await.js'

var validModes = {
  'file': true,
  'pipe': true
}

export var makeCommandHandler = 
(cmdArgsExtractor, inputMode, outputMode) => {
  if(typeof(cmdArgsExtractor) != 'function')
    throw new Error('command args extractor must be function')

  if(!validModes[inputMode] || !validModes[outputMode])
    throw new Error('invalid input/output mode')

  var inputFileMode = inputMode == 'file'
  var outputFileMode = outputMode == 'file'

  return streamHandlerBuilder(config => {
    var {
      tempPathBuilder=tempPath,
      commandTimeout
    } = config

    return async(function*(args, inputStreamable) {
      if(inputFileMode) {
        var fileStreamable = yield toFileStreamable(
          inputStreamable, tempPathBuilder)

        var inputIsTemp = fileStreamable.tempFile

        args.inputFile = yield fileStreamable.toFilePath()
      }

      if(outputFileMode) {
        var outPath = args.outputFile = yield tempPathBuilder()
      }

      var commandArgs = yield cmdArgsExtractor(args)

      var command = spawnProcess(commandArgs[0], 
        commandArgs.slice(1))

      if(inputFileMode) {
        command.stdin.end()
      } else {
        var inputStream = yield inputStreamable.toStream()
        var stdinStream = nodeToQuiverWriteStream(command.stdin)
        pipeStream(inputStream, stdinStream)
      }

      if(outputFileMode) {
        command.stdout.resume()
        command.stderr.resume()

        try {
          yield awaitProcess(command, commandTimeout)
        } finally {
          if(inputIsTemp) unlink(inPath, ()=>{})
        }

        return tempFileStreamable(outPath)

      } else {
        var stdoutStreamable = reuseStream(
          nodeToQuiverReadStream(command.stdout))

        var stderrStreamable = reuseStream(
          nodeToQuiverReadStream(command.stderr))

        try {
          yield awaitProcess(command, commandTimeout)
        } catch(err) {
          var message = yield streamableToText(stderrStreamable)
          throw error(500, 'error executing command: ' + message)
        }

        return stdoutStreamable
      }
    })
  })
}