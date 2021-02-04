import { NextApiRequest, NextApiResponse } from 'next'
import requestHandler from '../../../libs/requestHandler'
import getIpAddress from '../../../libs/getIpAddress'
import RateLimit from '../../../libs/rateLimit'
import { RateLimitError } from '../../../libs/errors'
import resolveFile from '../../../libs/resolveFile'

const rateLimit = new RateLimit(1000, 60 * 1000)

export default requestHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  if (!rateLimit.limit(res, `ip:${getIpAddress(req)},url:/api/countries`, 10)) {
    throw new RateLimitError('Rate limit of 10 requests every 60 seconds exceeded.')
  }

  console.log('req.url', req.url)

  // res.setHeader('Cache-Control', 'maxage=86400, s-maxage=86400, stale-while-revalidate')
  res.setHeader('Cache-Control', 'maxage=86400, s-maxage=30, stale-while-revalidate')

  return resolveFile('data', 'tmp', 'countries.json')
})