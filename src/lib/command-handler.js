import { unlink } from 'fs'
import { path as tempPath } from 'temp'
import { spawn as spawnProcess } from 'child_process'

import { assertFunction } from 'quiver-core/util/assert'
import { overrideConfig  } from 'quiver-core/component/method'

import {
  reuseStream, streamableToText,
  pipeStream, emptyStreamable,
  nodeToQuiverReadStream,
  nodeToQuiverWriteStream
} from 'quiver-core/stream-util'

import {
  streamableToFile, tempFileStreamable
} from 'quiver-core/file-stream'

import { extract } from 'quiver-core/util/immutable'
import { streamHandlerBuilder } from 'quiver-core/component/constructor'

import { awaitProcess } from './await'
import { commandError } from './error'

const validModes = new Set(['file', 'stream', 'ignore'])

const isValidMode = mode =>
  validModes.has(mode)

export const commandHandler = options => {
  const { inputMode, outputMode } = options

  if(!isValidMode(inputMode) || !isValidMode(outputMode))
    throw new Error('invalid input/output mode')

  return streamHandlerBuilder(config => {
    const {
      commandArgsExtractor,
      commandTimeout,
      tempPathBuilder=tempPath
    } = config::extract()

    return async (args, inputStreamable) => {
      let inputIsTemp = false

      let inPath = null
      if(inputMode === 'file') {
        ;[inPath, inputIsTemp] = await streamableToFile(
          inputStreamable, tempPathBuilder)

        args = args.set('inputFile', inPath)
      }

      let outPath = null
      if(outputMode === 'file') {
        outPath = await tempPathBuilder()
        args = args.set('outputFile', outPath)
      }

      const commandArgs = await commandArgsExtractor(args)

      const command = spawnProcess(commandArgs[0],
        commandArgs.slice(1))

      if(inputMode === 'file' || inputMode === 'ignore') {
        command.stdin.end()
      } else {
        const inputStream = await inputStreamable.toStream()
        const stdinStream = nodeToQuiverWriteStream(command.stdin)
        pipeStream(inputStream, stdinStream)
      }

      if(outputMode === 'file') {
        command.stdout.resume()
        command.stderr.resume()

        try {
          await awaitProcess(command, commandTimeout)
        } finally {
          if(inputIsTemp) unlink(inPath, ()=>{})
        }

        return tempFileStreamable(outPath)

      } else if(outputMode === 'stream') {
        const stdoutStreamable = reuseStream(
          nodeToQuiverReadStream(command.stdout))

        const stderrStreamable = reuseStream(
          nodeToQuiverReadStream(command.stderr))

        try {
          await awaitProcess(command, commandTimeout)
        } catch(err) {
          const { exitCode } = err
          const message = await streamableToText(stderrStreamable)
          throw commandError(exitCode, `command failed with code ${exitCode}: ${message}`)
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
}

export const simpleCommandHandler = options => {
  const {
    inputMode, outputMode, commandArgsExtractor
  } = options

  assertFunction(commandArgsExtractor,
    'options.commandArgsExtractor must be function')

  return commandHandler({ inputMode, outputMode })
    ::overrideConfig({ commandArgsExtractor })
}
