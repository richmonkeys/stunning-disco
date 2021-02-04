import { NextApiRequest, NextApiResponse } from 'next'
import requestHandler from '../../../libs/requestHandler'
import RateLimit from '../../../libs/rateLimit'
import { NotFoundError, RateLimitError } from '../../../libs/errors'
import getIpAddress from '../../../libs/getIpAddress'
import resolveFile from '../../../libs/resolveFile'

const rateLimit = new RateLimit(1000, 60 * 1000)

export default requestHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  const countryCode = req.query.countryCode as string

  if (!rateLimit.limit(res, `ip:${getIpAddress(req)},url:/api/countries/[countryCode]`, 10)) {
    throw new RateLimitError('Rate limit of 10 requests every 60 seconds exceeded.')
  }

  const countries: any[] = JSON.parse(resolveFile('data', 'tmp', 'countries.json').toString())
  // const countries: any[] = require('../../../data/countries.json')
  const country = countries.find(country => country.countryCode === countryCode)

  if (!country) {
    throw new NotFoundError()
  }

  res.setHeader('Cache-Control', 'maxage=86400, s-maxage=86400, stale-while-revalidate')

  return country
})