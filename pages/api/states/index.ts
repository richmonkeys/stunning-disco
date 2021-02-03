import { NextApiRequest, NextApiResponse } from 'next'
import requestHandler from '../../../libs/requestHandler'
import { BadRequestError, RateLimitError } from '../../../libs/errors'
import RateLimit from '../../../libs/rateLimit'
import getIpAddress from '../../../libs/getIpAddress'
import { existsSync, readFileSync } from 'fs'
import { join } from 'path'

const rateLimit = new RateLimit(1000, 60 * 1000)

export default requestHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  const countryCode = req.query.countryCode as string

  if (!countryCode) {
    throw new BadRequestError('Query countryCode is required.')
  }

  if (!rateLimit.limit(res, `ip:${getIpAddress(req)},url:/api/states`, 10)) {
    throw new RateLimitError('Rate limit of 10 requests every 60 seconds exceeded.')
  }

  res.setHeader('Cache-Control', 'maxage=86400, s-maxage=86400, stale-while-revalidate')

  const statesJSONPath = join(process.cwd(), 'data', 'states.json')
  if (!existsSync(statesJSONPath)) {
    return []
  }

  const states: any[] = JSON.parse(readFileSync(statesJSONPath).toString())
  // const states: any[] = require('../../../data/states.json')
  return states.filter(state => state.countryCode === countryCode)
})