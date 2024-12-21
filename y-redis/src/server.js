import * as uws from 'uws'
import * as logging from 'lib0/logging'
import * as error from 'lib0/error'
import { registerYWebsocketServer } from '../src/ws.js'
import * as promise from 'lib0/promise'

class YWebsocketServer {
  /**
   * @param {uws.TemplatedApp} app
   */
  constructor (app) {
    this.app = app
  }

  async destroy () {
    this.app.close()
  }
}

/**
 * @param {Object} opts
 * @param {number} opts.port
 * @param {import('./storage.js').AbstractStorage} opts.store
 * @param {string} [opts.redisPrefix]
 * @param {string} opts.checkPermCallbackUrl
 * @param {(room:string,docname:string,client:import('./api.js').Api)=>void} [opts.initDocCallback] -
 * this is called when a doc is accessed, but it doesn't exist. You could populate the doc here.
 * However, this function could be called several times, until some content exists. So you need to
 * handle concurrent calls.
 */
export const createYWebsocketServer = async ({
  redisPrefix = 'y',
  port,
  store,
  checkPermCallbackUrl,
  initDocCallback = () => {}
}) => {
  checkPermCallbackUrl += checkPermCallbackUrl.slice(-1) !== '/' ? '/' : ''
  const app = uws.App({})
  await registerYWebsocketServer(app, '/:room', store, async (req) => {
    const room = req.getParameter(0)
    return {hasWriteAccess: true, room, userid: ""}
  }, { redisPrefix, initDocCallback })

  await promise.create((resolve, reject) => {
    app.listen(port, (token) => {
      if (token) {
        logging.print(logging.GREEN, '[y-redis] Listening to port ', port)
        resolve()
      } else {
        const err = error.create('[y-redis] Failed to lisen to port ' + port)
        reject(err)
        throw err
      }
    })
  })
  return new YWebsocketServer(app)
}
