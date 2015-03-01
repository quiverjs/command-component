import 'quiver-core/traceur'

import { async } from 'quiver-core/promise'
import { fileStreamable } from 'quiver-core/file-stream'
import { streamableToText } from 'quiver-core/stream-util'
import { loadStreamHandler } from 'quiver-core/component'

import fs from 'fs'
let { readFileSync } = fs

import { commandHandler } from '../lib/command-component.js'

import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'

chai.use(chaiAsPromised)
let should = chai.should()

describe('stdio convert test', () => {
  it('basic test', async(function*() {
    let testFile = './test-content/00.txt'
    let expectedFile ='./test-content/00-grep.txt'
    let expectedResult = readFileSync(expectedFile).toString()

    let getCommandArgs = args =>
      ['grep', 'IPSUM']

    let stdioConvertHandler = commandHandler()
      .configOverride({
        cmdArgsExtractor: getCommandArgs,
        inputMode: 'pipe',
        outputMode: 'pipe'
      })
      
    let handler = yield stdioConvertHandler.loadHandler({})
    let streamable = yield fileStreamable(testFile)

    yield handler({}, streamable).then(streamableToText)
      .should.eventually.equal(expectedResult)
  }))
})