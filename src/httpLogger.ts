import pinoHttp from 'pino-http'
import logger from './logger'

const httpLogger = pinoHttp({
  logger,
  customLogLevel: (req, res, error) => {
    if (res.statusCode >= 500) return 'error'
    if (res.statusCode >= 400) return 'warn'
    return 'info'
  },
  customSuccessMessage: (req, res) => {
    return 'request completed'
  },
  customAttributeKeys: {
    req: 'req',
    res: 'res',
    responseTime: 'responseTime',
  },
  serializers: {
    req: (req) => ({
      id: req.id,
      method: req.method,
      url: req.url,
      query: req.query,
      params: req.params || {},
      headers: req.headers,
      remoteAddress: req.socket?.remoteAddress,
      remotePort: req.socket?.remotePort,
    }),
    res: (res) => ({
      statusCode: res.statusCode,
      headers: res.headers || {},
    }),
  },
})

export default httpLogger
