import fs from 'fs'
import test from 'tape'
import { asyncTest } from 'quiver-core/util/tape'

import { extract } from 'quiver-core/util/immutable'
import { promisify } from 'quiver-core/util/promise'

import { fileStreamable } from 'quiver-core/file-stream'
import { streamableToText } from 'quiver-core/stream-util'

import { overrideConfig  } from 'quiver-core/component/method'
import {
  loadHandler,
  createArgs as Args,
  createConfig as Config
} from 'quiver-core/component/util'

import { commandHandler } from '../lib'

const readFile = promisify(fs.readFile)

test('file convert handler test', assert => {
  assert::asyncTest('basic test', async assert => {
    const testFile = './test-content/00.txt'
    const expectedFile ='./test-content/00-ucase.txt'
    const expectedResult = (await readFile(expectedFile)).toString()

    const getCommandArgs = args => {
      const { inputFile, outputFile } = args::extract()
      return ['dd', `if=${inputFile}`, `of=${outputFile}`, 'conv=ucase']
    }

    const tempPathBuilder = () =>
      './test-content/temp/' + (new Date()).getTime()
        + '-' + (Math.random()*10000|0) + '.tmp'

    const config = Config({
      tempPathBuilder
    })

    const fileConvertHandler = commandHandler()
      ::overrideConfig({
        cmdArgsExtractor: getCommandArgs,
        inputMode: 'file',
        outputMode: 'file'
      })

    const handler = await loadHandler(config, fileConvertHandler)
    const streamable = await fileStreamable(testFile)

    const result = await handler(Args(), streamable)
      .then(streamableToText)

    assert.equal(result, expectedResult)

    assert.end()
  })
})
