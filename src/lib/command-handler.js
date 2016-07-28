import { unlink } from 'fs'
import { path as tempPath } from 'temp'
import { spawn as spawnProcess } from 'child_process'

import { error } from 'quiver-core/util/error'

import {
  reuseStream, streamableToText,
  pipeStream, emptyStreamable,
  nodeToQuiverReadStream,
  nodeToQuiverWriteStream
} from 'quiver-core/stream-util'

import {
  toFileStreamable, tempFileStreamable
} from 'quiver-core/file-stream'

import { extract } from 'quiver-core/util/immutable'
import { streamHandlerBuilder } from 'quiver-core/component/constructor'

import { awaitProcess } from './await'

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
  } = config::extract()

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

  return async (args, inputStreamable) => {
    let inputIsTemp = false

    let inPath = null
    if(inputFileMode) {
      const fileStreamable = await toFileStreamable(
        inputStreamable, tempPathBuilder)

      inputIsTemp = fileStreamable.tempFile

      inPath = await fileStreamable.toFilePath()
      args = args.set('inputFile', inPath)
    }

    let outPath = null
    if(outputFileMode) {
      outPath = await tempPathBuilder()
      args = args.set('outputFile', outPath)
    }

    const commandArgs = await cmdArgsExtractor(args)

    const command = spawnProcess(commandArgs[0],
      commandArgs.slice(1))

    if(inputFileMode || inputIgnoreMode) {
      command.stdin.end()
    } else {
      const inputStream = await inputStreamable.toStream()
      const stdinStream = nodeToQuiverWriteStream(command.stdin)
      pipeStream(inputStream, stdinStream)
    }

    if(outputFileMode) {
      command.stdout.resume()
      command.stderr.resume()

      try {
        await awaitProcess(command, commandTimeout)
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
        await awaitProcess(command, commandTimeout)
      } catch(err) {
        const message = await streamableToText(stderrStreamable)
        throw error(500, 'error executing command: ' + message)
      }

      return stdoutStreamable
    } else {
      command.stdout.resume()
      command.stderr.resume()

      await awaitProcess(command, commandTimeout)
      return emptyStreamable()
    }
  }
})

export const makeCommandHandler = commandHandler.export()
