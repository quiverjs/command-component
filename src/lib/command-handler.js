import { error } from 'quiver-core/error'
import { async, createPromise } from 'quiver-core/promise'
import { streamHandlerBuilder } from 'quiver-core/component'

import fs from 'fs'
let { unlink } = fs

import tempLib from 'temp'
let { path: tempPath } = tempLib

import childProcess from 'child_process'
let { spawn: spawnProcess } = childProcess

import { 
  reuseStream, streamableToText, 
  pipeStream, emptyStreamable,
  nodeToQuiverReadStream, 
  nodeToQuiverWriteStream 
} from 'quiver-core/stream-util'

import { 
  toFileStreamable, tempFileStreamable 
} from 'quiver-core/file-stream'

import { awaitProcess } from './await.js'

let validModes = {
  'file': true,
  'pipe': true,
  'ignore': true
}

export let commandHandler = streamHandlerBuilder(
config => {
  let { 
    cmdArgsExtractor, inputMode, outputMode,
    commandTimeout, tempPathBuilder=tempPath,
  } = config

  if(typeof(cmdArgsExtractor) != 'function')
    throw new Error('command args extractor must be function')

  if(!validModes[inputMode] || !validModes[outputMode])
    throw new Error('invalid input/output mode')

  let inputFileMode = (inputMode == 'file')
  let inputPipeMode = (inputMode == 'pipe')
  let inputIgnoreMode = (inputMode == 'ignore')

  let outputFileMode = (outputMode == 'file')
  let outputPipeMode = (outputMode == 'pipe')
  let outputIgnoreMode = (outputMode == 'ignore')

  return async(function*(args, inputStreamable) {
    let inputIsTemp = false

    if(inputFileMode) {
      let fileStreamable = yield toFileStreamable(
        inputStreamable, tempPathBuilder)

      inputIsTemp = fileStreamable.tempFile

      args.inputFile = yield fileStreamable.toFilePath()
    }

    let outPath = null
    if(outputFileMode) {
      outPath = args.outputFile = yield tempPathBuilder()
    }

    let commandArgs = yield cmdArgsExtractor(args)

    let command = spawnProcess(commandArgs[0], 
      commandArgs.slice(1))

    if(inputFileMode || inputIgnoreMode) {
      command.stdin.end()
    } else {
      let inputStream = yield inputStreamable.toStream()
      let stdinStream = nodeToQuiverWriteStream(command.stdin)
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

    } else if(outputPipeMode) {
      let stdoutStreamable = reuseStream(
        nodeToQuiverReadStream(command.stdout))

      let stderrStreamable = reuseStream(
        nodeToQuiverReadStream(command.stderr))

      try {
        yield awaitProcess(command, commandTimeout)
      } catch(err) {
        let message = yield streamableToText(stderrStreamable)
        throw error(500, 'error executing command: ' + message)
      }

      return stdoutStreamable
    } else {
      command.stdout.resume()
      command.stderr.resume()

      yield awaitProcess(command, commandTimeout)
      return emptyStreamable()
    }
  })
})

export let makeCommandHandler = commandHandler.factory()