import { NextApiResponse } from 'next'
import { ServerError } from './errors'

const errorHandler = (res: NextApiResponse, error: ServerError) => {
  console.warn(new Date(), 'errorHandler', error)
  res.status(error.status ?? 400)
  res.send(error)
  res.end()
}

export default errorHandler