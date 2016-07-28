import { error } from 'quiver-core/util/error'

export const commandError = (exitCode, message) => {
  const err = error(500, message)
  if(exitCode) {
    err.exitCode = exitCode
  }
  return err
}
