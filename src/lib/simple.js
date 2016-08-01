import { unlink } from 'fs'
import { path as tempPath } from 'temp'

import { assertFunction } from 'quiver-core/util/assert'

import {
  closeStreamable,
  reuseStreamable, streamableToText
} from 'quiver-core/stream-util'

import {
  streamableToFile, tempFileStreamable
} from 'quiver-core/file-stream'

import { extract } from 'quiver-core/util/immutable'
import { streamHandlerBuilder } from 'quiver-core/component/constructor'

import { commandError } from './error'

import { spawnProcess } from './spawn'

const validModes = new Set(['file', 'stream'])

const isValidMode = mode =>
  validModes.has(mode)

export const simpleCommandHandler = options => {
  const {
    inputMode, outputMode, commandArgsExtractor
  } = options

  assertFunction(commandArgsExtractor,
    'options.commandArgsExtractor must be function')

  if(!isValidMode(inputMode) || !isValidMode(outputMode))
    throw new Error('invalid input/output mode')

  return streamHandlerBuilder(config => {
    const {
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

      const [commandName, ...commandArgs] = commandArgsExtractor(args)

      const results = spawnProcess(commandName, commandArgs, inputStreamable)

      let {
        exitPromise,
        stdoutStreamable,
        stderrStreamable
      } = results

      if(outputMode === 'file') {
        closeStreamable(stdoutStreamable)
        closeStreamable(stderrStreamable)

        try {
          await exitPromise
        } finally {
          if(inputIsTemp) unlink(inPath, ()=>{})
        }

        return tempFileStreamable(outPath)

      } else {
        stdoutStreamable = reuseStreamable(stdoutStreamable)
        stderrStreamable = reuseStreamable(stderrStreamable)

        try {
          await exitPromise
        } catch(err) {
          const { exitCode } = err
          const message = await streamableToText(stderrStreamable)
          throw commandError(exitCode, `command failed with code ${exitCode}: ${message}`)
        }

        return stdoutStreamable
      }
    }
  })
}
