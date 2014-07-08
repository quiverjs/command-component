import 'traceur'
import { readFileSync } from 'fs'
import { fileStreamable } from 'quiver-file-stream'
import { streamableToText } from 'quiver-stream-util'
import { loadStreamHandler } from 'quiver-component'

import { stdioConvertHandler } from '../lib/stdio-convert.js'

var chai = require('chai')
var chaiAsPromised = require('chai-as-promised')

chai.use(chaiAsPromised)
var should = chai.should()

describe('stdio convert test', () => {
  it('basic test', () => {
    var testFile = './test-content/00.txt'
    var expectedFile ='./test-content/00-grep.txt'
    var expectedResult = readFileSync(expectedFile).toString()

    var getCommandArgs = args =>
      ['grep', 'IPSUM']

    var config = { getCommandArgs }

    return Promise.all([
      loadStreamHandler(config, stdioConvertHandler),
      fileStreamable(testFile)
    ]).then(([handler, inputStreamable]) => 
      handler({}, inputStreamable).then(streamableToText)
      .then(result => {
        result.should.equal(expectedResult)
      }))
  })
})