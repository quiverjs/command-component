import { async } from 'quiver/promise'
import { fileStreamable } from 'quiver/file-stream'
import { streamableToText } from 'quiver/stream-util'

import fs from 'fs'
const { readFileSync } = fs

import { commandHandler } from '../lib/command-component.js'

import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'

chai.use(chaiAsPromised)
const should = chai.should()

describe('file convert handler test', () => {
  it('basic test', async(function*() {
    const testFile = './test-content/00.txt'
    const expectedFile ='./test-content/00-ucase.txt'
    const expectedResult = readFileSync(expectedFile).toString()

    const getCommandArgs = ({inputFile, outputFile}) =>
      ['dd', 'if='+inputFile, 'of='+outputFile, 'conv=ucase']

    const tempPathBuilder = () =>
      './test-content/temp/' + (new Date()).getTime() 
        + '-' + (Math.random()*10000|0) + '.tmp'

    const config = {
      tempPathBuilder
    }

    const fileConvertHandler = commandHandler()
      .configOverride({
        cmdArgsExtractor: getCommandArgs,
        inputMode: 'file',
        outputMode: 'file'
      })

    const handler = yield fileConvertHandler.loadHandler(config)
    const streamable = yield fileStreamable(testFile)

    yield handler({}, streamable).then(streamableToText)
      .should.eventually.equal(expectedResult)
  }))
})