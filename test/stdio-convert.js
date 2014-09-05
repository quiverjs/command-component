import 'traceur'

import { async } from 'quiver-promise'
import { fileStreamable } from 'quiver-file-stream'
import { streamableToText } from 'quiver-stream-util'
import { loadStreamHandler } from 'quiver-component'

import fs from 'fs'
var { readFileSync } = fs

import { makeCommandHandler } from '../lib/command-handler.js'

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

    var stdioConvertHandler = makeCommandHandler(
      getCommandArgs, 'pipe', 'pipe')

    var handler = yield loadStreamHandler({ }, stdioConvertHandler)
    var streamable = yield fileStreamable(testFile)

    yield handler({}, streamable).then(streamableToText)
      .should.eventually.equal(expectedResult)
  }))
})