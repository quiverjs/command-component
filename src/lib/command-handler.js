import { error } from 'quiver-core/error'
import { async, createPromise } from 'quiver-core/promise'
import { streamHandlerBuilder } from 'quiver-core/component'

import fs from 'fs'
const { unlink } = fs

import tempLib from 'temp'
const { path: tempPath } = tempLib

import childProcess from 'child_process'
const { spawn: spawnProcess } = childProcess

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

const validModes = {
  'file': true,
  'pipe': true,
  'ignore': true
}

export const commandHandler = streamHandlerBuilder(
config => {
  const { 
    cmdArgsExtractor, inputMode, outputMode,
    commandTimeout, tempPathBuilder=tempPath,
  } = config

  if(typeof(cmdArgsExtractor) != 'function')
    throw new Error('command args extractor must be function')

  if(!validModes[inputMode] || !validModes[outputMode])
    throw new Error('invalid input/output mode')

  const inputFileMode = (inputMode == 'file')
  const inputPipeMode = (inputMode == 'pipe')
  const inputIgnoreMode = (inputMode == 'ignore')

  const outputFileMode = (outputMode == 'file')
  const outputPipeMode = (outputMode == 'pipe')
  const outputIgnoreMode = (outputMode == 'ignore')

  return async(function*(args, inputStreamable) {
    let inputIsTemp = false

    if(inputFileMode) {
      const fileStreamable = yield toFileStreamable(
        inputStreamable, tempPathBuilder)

      inputIsTemp = fileStreamable.tempFile

      args.inputFile = yield fileStreamable.toFilePath()
    }

    let outPath = null
    if(outputFileMode) {
      outPath = args.outputFile = yield tempPathBuilder()
    }

    const commandArgs = yield cmdArgsExtractor(args)

    const command = spawnProcess(commandArgs[0], 
      commandArgs.slice(1))

    if(inputFileMode || inputIgnoreMode) {
      command.stdin.end()
    } else {
      const inputStream = yield inputStreamable.toStream()
      const stdinStream = nodeToQuiverWriteStream(command.stdin)
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
      const stdoutStreamable = reuseStream(
        nodeToQuiverReadStream(command.stdout))

      const stderrStreamable = reuseStream(
        nodeToQuiverReadStream(command.stderr))

      try {
        yield awaitProcess(command, commandTimeout)
      } catch(err) {
        const message = yield streamableToText(stderrStreamable)
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

export const makeCommandHandler = commandHandler.factory()