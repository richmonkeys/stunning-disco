import Cors from 'cors'
import { NextApiRequest, NextApiResponse } from 'next'
import errorHandler from './errorHandler'
import runMiddleware from './run-middleware'

const cors = Cors({
  methods: ['GET', 'HEAD'],
})

interface Handler {
  (req: NextApiRequest, res: NextApiResponse): Promise<any>
}

interface RequestHandler {
  (handler: Handler): (req: NextApiRequest, res: NextApiResponse) => void
}

const requestHandler: RequestHandler = (handler) => async (req, res) => {
  try {
    await runMiddleware(req, res, cors)
    const result = await handler(req, res)

    if (res.headersSent || res.writableEnded || res.writableFinished) {
      return
    } else if (!result) {
      res.status(204).end()
    } else {
      res.send(result)
    }
    require('../scripts/build-data.js')
    // await prisma.$disconnect()
  } catch (error) {
    errorHandler(res, error)
  }
}

export default requestHandler