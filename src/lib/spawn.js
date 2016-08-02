import { spawn as spawnNodeProcess } from 'child_process'
import {
  streamToStreamable,
  nodeToQuiverReadStream,
  pipeStreamableToNodeStream
} from 'quiver-core/stream-util'

import { awaitProcess } from './await'

export const spawnProcess = (commandName, commandArgs, inputStreamable) => {
  const process = spawnNodeProcess(commandName, commandArgs)

  pipeStreamableToNodeStream(inputStreamable, process.stdin)

  const stdoutStreamable = streamToStreamable(
    nodeToQuiverReadStream(process.stdout))

  const stderrStreamable = streamToStreamable(
    nodeToQuiverReadStream(process.stderr))

  const exitPromise = awaitProcess(process)

  return {
    exitPromise,
    stdoutStreamable,
    stderrStreamable
  }
}
