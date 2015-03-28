import { async } from 'quiver/promise'
import { fileStreamable } from 'quiver/file-stream'
import { streamableToText } from 'quiver/stream-util'
import { loadStreamHandler } from 'quiver/component'

import fs from 'fs'
const { readFileSync } = fs

import { commandHandler } from '../lib/command-component.js'

import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'

chai.use(chaiAsPromised)
const should = chai.should()

describe('stdio convert test', () => {
  it('basic test', async(function*() {
    const testFile = './test-content/00.txt'
    const expectedFile ='./test-content/00-grep.txt'
    const expectedResult = readFileSync(expectedFile).toString()

    const getCommandArgs = args =>
      ['grep', 'IPSUM']

    const stdioConvertHandler = commandHandler()
      .configOverride({
        cmdArgsExtractor: getCommandArgs,
        inputMode: 'pipe',
        outputMode: 'pipe'
      })
      
    const handler = yield stdioConvertHandler.loadHandler({})
    const streamable = yield fileStreamable(testFile)

    yield handler({}, streamable).then(streamableToText)
      .should.eventually.equal(expectedResult)
  }))
})