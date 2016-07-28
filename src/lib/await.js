import { error } from 'quiver-core/util/error'

export const awaitProcess = (process, timeout=-1) =>
  new Promise((resolve, reject) => {
    let processExited = false

    process.on('exit', code => {
      if(processExited) return

      processExited = true
      if(code != 0) return reject(error(500,
        'child process exited with error code ' + code))

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
