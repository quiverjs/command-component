import 'traceur'
import { readFileSync } from 'fs'
import { fileStreamable } from 'quiver-file-stream'
import { streamableToText } from 'quiver-stream-util'

import { fileConvertHandler } from '../lib/file-convert.js'

var chai = require('chai')
var chaiAsPromised = require('chai-as-promised')

chai.use(chaiAsPromised)
var should = chai.should()

describe('file convert handler test', () => {
  it('basic test', () => {
    var testFile = './test-content/00.txt'
    var expectedFile ='./test-content/00-ucase.txt'
    var expectedResult = readFileSync(expectedFile).toString()

    var getCommandArgs = (args, inPath, outPath) =>
      ['dd', 'if='+inPath, 'of='+outPath, 'conv=ucase']

    var getTempPath = () =>
      './test-content/temp/' + (new Date()).getTime() 
        + '-' + (Math.random()*10000|0) + '.tmp'

    var config = {
      getCommandArgs,
      getTempPath
    }

    return Promise.all([
      fileConvertHandler.loadHandler(config),
      fileStreamable(testFile)
    ]).then(([handler, inputStreamable]) =>
      handler({}, inputStreamable).then(streamableToText)
      .then(result => {
        result.should.equal(expectedResult)
      }))
  })
})