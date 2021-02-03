import { IncomingMessage } from 'http'

const getIpAddress = (req: IncomingMessage) =>
  (typeof req?.headers['x-forwarded-for'] === 'string'
    && req?.headers['x-forwarded-for'].split(',').shift())
  || req?.connection?.remoteAddress
  || req?.socket?.remoteAddress
// || req.connection?.socket?.remoteAddress

export default getIpAddress