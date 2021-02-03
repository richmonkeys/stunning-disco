import { NextApiRequest, NextApiResponse } from 'next'
import requestHandler from '../../../libs/requestHandler'
import RateLimit from '../../../libs/rateLimit'
import { NotFoundError, RateLimitError } from '../../../libs/errors'
import getIpAddress from '../../../libs/getIpAddress'
import { existsSync, readFileSync } from 'fs'
import { join } from 'path'

const rateLimit = new RateLimit(1000, 60 * 1000)

export default requestHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  const countryCode = req.query.countryCode as string

  res.setHeader('Cache-Control', 'maxage=86400, s-maxage=86400, stale-while-revalidate')

  if (!rateLimit.limit(res, `ip:${getIpAddress(req)},url:/api/countries/[countryCode]`, 10)) {
    throw new RateLimitError('Rate limit of 10 requests every 60 seconds exceeded.')
  }

  const countriesJSONPath = join(process.cwd(), 'data', 'countries.json')
  if (!existsSync(countriesJSONPath)) {
    return []
  }

  const countries: any[] = JSON.parse(readFileSync(countriesJSONPath).toString())
  // const countries: any[] = require('../../../data/countries.json')
  const country = countries.find(country => country.countryCode === countryCode)

  if (!country) {
    throw new NotFoundError()
  }

  return country
})