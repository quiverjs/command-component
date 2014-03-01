'use strict'

var error = require('quiver-error').error
var childProcessLib = require('child_process')
var nodeStreamLib = require('quiver-node-stream')
var streamConvert = require('quiver-stream-convert')
var pipeStream = require('quiver-pipe-stream').pipeStream
var logProcessIO = require('../lib/log-stdio').logProcessIO

var stdioConvertCommandHandlerBuilder = function(config, callback) {
  var commandArgsExtractor = config.commandArgsExtractor
  var resultContentType = config.resultContentType || 'application/octet-stream'

  var stdioLogger = config.stdioLogger
  var commandTimeout = config.commandTimeout
  var streamingResult = config.streamingResult

  var handler = function(args, inputStream, callback) {
    commandArgsExtractor(args, function(err, commandArgs) {
      if(err) return callback(err)
      
      var callbackCalled = false
      var commandProcess = childProcessLib.spawn(commandArgs[0], commandArgs.slice(1))

      var stdinStream = nodeStreamLib.createNodeWriteStreamAdapter(commandProcess.stdin)

      var stdoutStreamable = streamConvert.streamToReusableStreamable(
        nodeStreamLib.createNodeReadStreamAdapter(commandProcess.stdout))

      var stderrStreamable = streamConvert.streamToReusableStreamable(
        nodeStreamLib.createNodeReadStreamAdapter(commandProcess.stderr))

      stdoutStreamable.contentType = resultContentType

      if(stdioLogger) logProcessIO(stdioLogger, command, commandArgs)

      if(streamingResult) {
        callbackCalled = true
        callback(null, stdoutStreamable)
      }

      pipeStream(inputStream, stdinStream, function(err) {
        if(!err || callbackCalled) return
        callbackCalled = true

        callback(error(500, 'error piping input stream', err))
      })

      commandProcess.on('exit', function(code) {
        if(callbackCalled) return
        callbackCalled = true

        if(code == 0) {
          callback(null, stdoutStreamable)
        } else {
          streamableToText(stdoutStreamable, function(err, errorMessage) {
            if(err) return callback(error(500, 'error executing command'))

            callback(error(500, 'error executing command: ' + errorMessage))
          })
        }
      })

      if(commandTimeout) {
        setTimeout(function() {
          commandProcess.kill()

          if(callbackCalled) return
          callbackCalled = true

          callback(error(500, 'child process timeout'))
        }, commandTimeout)
      }
    })
  }

  callback(null, handler)
}

var quiverComponents = [
  {
    name: 'quiver stdio convert command handler',
    type: 'simple handler',
    inputType: 'stream',
    outputType: 'streamable',
    configParam: [
      {
        key: 'commandArgsExtractor',
        valueType: 'function',
        required: true
      },
      {
        key: 'stdioLogger',
        valueType: 'object'
      },
      {
        key: 'commandTimeout',
        valueType: 'number'
      },
      {
        key: 'streamingResult',
        valueType: 'boolean'
      },
      {
        key: 'resultContentType',
        valueType: 'string'
      }
    ],
    handlerBuilder: stdioConvertCommandHandlerBuilder
  }
]

module.exports = {
  quiverComponents: quiverComponents
}