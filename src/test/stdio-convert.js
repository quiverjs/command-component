import fs from 'fs'
import test from 'tape'
import { asyncTest } from 'quiver-core/util/tape'

import { promisify } from 'quiver-core/util/promise'

import { fileStreamable } from 'quiver-core/file-stream'
import { streamableToText } from 'quiver-core/stream-util'

import {
  loadHandler,
  createArgs as Args,
  createConfig as Config
} from 'quiver-core/component/util'

import { simpleCommandHandler } from '../lib'

const readFile = promisify(fs.readFile)

test('stdio convert test', assert => {
  assert::asyncTest('basic test', async assert => {
    const testFile = './test-content/00.txt'
    const expectedFile ='./test-content/00-grep.txt'
    const expectedResult = (await readFile(expectedFile)).toString()

    const getCommandArgs = args =>
      ['grep', 'IPSUM']

    const stdioConvertHandler = simpleCommandHandler({
      commandArgsExtractor: getCommandArgs,
      inputMode: 'pipe',
      outputMode: 'pipe'
    })

    const handler = await loadHandler(Config(), stdioConvertHandler)
    const streamable = await fileStreamable(testFile)

    const result = await handler(Args(), streamable)
      .then(streamableToText)

    assert.equal(result, expectedResult)

    assert.end()
  })
})
