import { async } from 'quiver-core/promise'
import { fileStreamable } from 'quiver-core/file-stream'
import { streamableToText } from 'quiver-core/stream-util'

import fs from 'fs'
let { readFileSync } = fs

import { commandHandler } from '../lib/command-component.js'

import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'

chai.use(chaiAsPromised)
let should = chai.should()

describe('file convert handler test', () => {
  it('basic test', async(function*() {
    let testFile = './test-content/00.txt'
    let expectedFile ='./test-content/00-ucase.txt'
    let expectedResult = readFileSync(expectedFile).toString()

    let getCommandArgs = ({inputFile, outputFile}) =>
      ['dd', 'if='+inputFile, 'of='+outputFile, 'conv=ucase']

    let tempPathBuilder = () =>
      './test-content/temp/' + (new Date()).getTime() 
        + '-' + (Math.random()*10000|0) + '.tmp'

    let config = {
      tempPathBuilder
    }

    let fileConvertHandler = commandHandler()
      .configOverride({
        cmdArgsExtractor: getCommandArgs,
        inputMode: 'file',
        outputMode: 'file'
      })

    let handler = yield fileConvertHandler.loadHandler(config)
    let streamable = yield fileStreamable(testFile)

    yield handler({}, streamable).then(streamableToText)
      .should.eventually.equal(expectedResult)
  }))
})