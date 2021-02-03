import { NextApiRequest, NextApiResponse } from 'next'
import requestHandler from '../../../libs/requestHandler'
import { NotFoundError, RateLimitError } from '../../../libs/errors'
import RateLimit from '../../../libs/rateLimit'
import getIpAddress from '../../../libs/getIpAddress'

const rateLimit = new RateLimit(1000, 60 * 1000)

export default requestHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  const stateCode = req.query.stateCode as string

  if (!rateLimit.limit(res, `ip:${getIpAddress(req)},url:/api/states/[stateCode]`, 10)) {
    throw new RateLimitError('Rate limit of 10 requests every 60 seconds exceeded.')
  }

  res.setHeader('Cache-Control', 'maxage=86400, s-maxage=86400, stale-while-revalidate')

  const states: any[] = require('../../../data/states.json')
  const state = states.find(state => state.stateCode === stateCode)

  if (!state) {
    throw new NotFoundError()
  }

  return state
})