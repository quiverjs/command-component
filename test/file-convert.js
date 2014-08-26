import 'traceur'

import { readFileSync } from 'fs'
import { async } from 'quiver-promise'
import { fileStreamable } from 'quiver-file-stream'
import { streamableToText } from 'quiver-stream-util'

import { makeCommandHandler } from '../lib/command-handler.js'

var chai = require('chai')
var chaiAsPromised = require('chai-as-promised')

chai.use(chaiAsPromised)
var should = chai.should()

describe('file convert handler test', () => {
  it.only('basic test', async(function*() {
    var testFile = './test-content/00.txt'
    var expectedFile ='./test-content/00-ucase.txt'
    var expectedResult = readFileSync(expectedFile).toString()

    var getCommandArgs = ({inputFile, outputFile}) =>
      ['dd', 'if='+inputFile, 'of='+outputFile, 'conv=ucase']

    var tempPathBuilder = () =>
      './test-content/temp/' + (new Date()).getTime() 
        + '-' + (Math.random()*10000|0) + '.tmp'

    var config = {
      tempPathBuilder
    }

    var fileConvertHandler = makeCommandHandler(
      getCommandArgs, 'file', 'file')

    var handler = yield fileConvertHandler.loadHandler(config)
    var streamable = yield fileStreamable(testFile)

    yield handler({}, streamable).then(streamableToText)
      .should.eventually.equal(expectedResult)
  }))
})