import { error } from 'quiver-core/util/error'
import { commandError } from './error'

export const awaitProcess = (process, timeout=-1) =>
  new Promise((resolve, reject) => {
    let processExited = false

    process.on('exit', exitCode => {
      if(processExited) return

      processExited = true
      if(exitCode == 0) {
        resolve()
      } else {
        reject(commandError(exitCode, `child process exited with non-zero exit code ${exitCode}`))
      }

      resolve()
    })

    if(timeout > 0) {
      setTimeout(() => {
        if(processExited) return

        processExited = true
        process.kill()

        reject(error(500, 'child process timeout'))

      }, timeout)
    }
  })
