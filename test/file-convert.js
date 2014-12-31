import 'quiver-core/traceur'

import { async } from 'quiver-core/promise'
import { fileStreamable } from 'quiver-core/file-stream'
import { streamableToText } from 'quiver-core/stream-util'

import fs from 'fs'
var { readFileSync } = fs

import { commandHandler } from '../lib/command-component.js'

import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'

chai.use(chaiAsPromised)
var should = chai.should()

describe('file convert handler test', () => {
  it('basic test', async(function*() {
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

    var fileConvertHandler = commandHandler()
      .configOverride({
        cmdArgsExtractor: getCommandArgs,
        inputMode: 'file',
        outputMode: 'file'
      })

    var handler = yield fileConvertHandler.loadHandler(config)
    var streamable = yield fileStreamable(testFile)

    yield handler({}, streamable).then(streamableToText)
      .should.eventually.equal(expectedResult)
  }))
})