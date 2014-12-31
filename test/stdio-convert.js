import 'quiver-core/traceur'

import { async } from 'quiver-core/promise'
import { fileStreamable } from 'quiver-core/file-stream'
import { streamableToText } from 'quiver-core/stream-util'
import { loadStreamHandler } from 'quiver-core/component'

import fs from 'fs'
var { readFileSync } = fs

import { commandHandler } from '../lib/command-component.js'

import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'

chai.use(chaiAsPromised)
var should = chai.should()

describe('stdio convert test', () => {
  it('basic test', async(function*() {
    var testFile = './test-content/00.txt'
    var expectedFile ='./test-content/00-grep.txt'
    var expectedResult = readFileSync(expectedFile).toString()

    var getCommandArgs = args =>
      ['grep', 'IPSUM']

    var stdioConvertHandler = commandHandler()
      .configOverride({
        cmdArgsExtractor: getCommandArgs,
        inputMode: 'pipe',
        outputMode: 'pipe'
      })
      
    var handler = yield stdioConvertHandler.loadHandler({})
    var streamable = yield fileStreamable(testFile)

    yield handler({}, streamable).then(streamableToText)
      .should.eventually.equal(expectedResult)
  }))
})