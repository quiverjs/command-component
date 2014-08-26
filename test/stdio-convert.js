import 'traceur'
import { readFileSync } from 'fs'
import { async } from 'quiver-promise'
import { fileStreamable } from 'quiver-file-stream'
import { streamableToText } from 'quiver-stream-util'
import { loadStreamHandler } from 'quiver-component'

import { makeStdioConvertHandler } from '../lib/stdio-convert.js'

var chai = require('chai')
var chaiAsPromised = require('chai-as-promised')

chai.use(chaiAsPromised)
var should = chai.should()

describe('stdio convert test', () => {
  it('basic test', async(function*() {
    var testFile = './test-content/00.txt'
    var expectedFile ='./test-content/00-grep.txt'
    var expectedResult = readFileSync(expectedFile).toString()

    var getCommandArgs = args =>
      ['grep', 'IPSUM']

    var config = { getCommandArgs }

    var stdioConvertHandler = makeStdioConvertHandler()

    var handler = yield loadStreamHandler(config, stdioConvertHandler)
    var streamable = yield fileStreamable(testFile)

    yield handler({}, streamable).then(streamableToText)
      .should.eventually.equal(expectedResult)
  }))
})