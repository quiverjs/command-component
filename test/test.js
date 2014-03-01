'use strict'

var fs = require('fs')
var pathLib = require('path')
var should = require('should')
var moduleLib = require('quiver-module')
var configLib = require('quiver-config')
var componentLib = require('quiver-component')
var fileStreamLib = require('quiver-file-stream')
var streamConvert = require('quiver-stream-convert')
var copyObject = require('quiver-copy').copyObject
var commandComponent = require('../lib/command-component')

var quiverComponents = moduleLib.loadComponentsFromQuiverModule(
  commandComponent.quiverModule)

var stdioCommandArgsExtractor = function(args, callback) {
  callback(null, args.commandArgs)
}

var fileConvertCommandArgsExtractor = function(args, inputPath, outputPath, callback) {
  var commandArgs = ['tar', '-cf', outputPath, inputPath]
  callback(null, commandArgs)
}

var tempPathBuilder = function(callback) {
  var tempId = '' + (new Date()).getTime() + '.tmp'
  var path = pathLib.join(__dirname, '../test-content/temp', tempId)
  callback(null, path)
}

describe('command component test', function() {
  var componentConfig

  before(function(callback) {
    componentLib.installComponents(quiverComponents, function(err, config) {
      if(err) return callback(err)

      componentConfig = config
      callback()
    })
  })

  it('stdio convert command test', function(callback) {
    var testFile = pathLib.join(__dirname, '../test-content/00.txt')
    var expectedFile = pathLib.join(__dirname, '../test-content/00-grep.txt')
    var expectedResult = fs.readFileSync(expectedFile, 'utf8')

    var commandArgs = ['grep', 'IPSUM']

    var config = copyObject(componentConfig)
    config.commandArgsExtractor = stdioCommandArgsExtractor

    configLib.loadStreamHandler(config, 'quiver stdio convert command handler',
    function(err, handler) {
      if(err) return callback(err)
      
      fileStreamLib.createFileStreamable(testFile, function(err, inputStreamable) {
        if(err) return callback(err)
        
        var args = { commandArgs: commandArgs }
        handler(args, inputStreamable, function(err, resultStreamable) {
          if(err) return callback(err)
          
          streamConvert.streamableToText(resultStreamable, function(err, result) {
            if(err) return callback(err)
            
            should.equal(result, expectedResult)
            callback()
          })
        })
      })
    })
  })

  it('file convert command test', function(callback) {
    var testFile = pathLib.join(__dirname, '../test-content/00.txt')
    var expectedFile = pathLib.join(__dirname, '../test-content/00-tar.tar')
    var expectedResult = fs.readFileSync(expectedFile)

    var config = copyObject(componentConfig)
    config.commandArgsExtractor = fileConvertCommandArgsExtractor
    config.inputTempPathBuilder = tempPathBuilder
    config.outputTempPathBuilder = tempPathBuilder

    configLib.loadStreamHandler(config, 'quiver file convert command handler',
    function(err, handler) {
      if(err) return callback(err)

      fileStreamLib.createFileStreamable(testFile, function(err, inputStreamable) {
        if(err) return callback(err)
        
        handler({}, inputStreamable, function(err, resultStreamable) {
          if(err) return callback(err)
          
          streamConvert.streamableToBuffer(resultStreamable, function(err, result) {
            if(err) return callback(err)
            
            should.equal(expectedResult.length, result.length)
            callback()
          })
        })
      })
    })
  })
})