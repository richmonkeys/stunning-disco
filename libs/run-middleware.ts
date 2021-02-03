import { NextApiRequest, NextApiResponse } from 'next'

interface Middleware<T = any> {
  (req: NextApiRequest, res: NextApiResponse, callback: (result: T) => void)
}

interface RunMiddleware<T = any> {
  (req: NextApiRequest, res: NextApiResponse, fn: Middleware<T>): Promise<T>
}

const runMiddleware: RunMiddleware = (req: NextApiRequest, res: NextApiResponse, middleware) => {
  return new Promise((resolve, reject) => {
    middleware(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result)
      }

      return resolve(result)
    })
  })
}

export default runMiddleware