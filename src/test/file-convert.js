import fs from 'fs'
import test from 'tape'
import { asyncTest } from 'quiver-core/util/tape'

import { extract } from 'quiver-core/util/immutable'
import { promisify } from 'quiver-core/util/promise'

import { fileStreamable } from 'quiver-core/file-stream'
import { streamableToText } from 'quiver-core/stream-util'

import {
  loadHandler,
  createArgs as Args,
  createConfig as Config
} from 'quiver-core/component/util'

import { simpleCommandHandler } from '../lib/constructor'

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

    const fileConvertHandler = simpleCommandHandler({
      commandArgsExtractor: getCommandArgs,
      inputMode: 'file',
      outputMode: 'file'
    })

    const config = Config({
      tempPathBuilder
    })

    const handler = await loadHandler(config, fileConvertHandler)
    const streamable = await fileStreamable(testFile)

    const result = await handler(Args(), streamable)
      .then(streamableToText)

    assert.equal(result, expectedResult)

    assert.end()
  })
})
