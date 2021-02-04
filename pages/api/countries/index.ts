import { NextApiRequest, NextApiResponse } from 'next'
import requestHandler from '../../../libs/requestHandler'
import getIpAddress from '../../../libs/getIpAddress'
import RateLimit from '../../../libs/rateLimit'
import { RateLimitError } from '../../../libs/errors'
import { existsSync, readFileSync } from 'fs'
import { join } from 'path'
import countries from '@richmonkeys/.stunning-disco/countries.json'

const rateLimit = new RateLimit(1000, 60 * 1000)

export default requestHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  if (!rateLimit.limit(res, `ip:${getIpAddress(req)},url:/api/countries`, 10)) {
    throw new RateLimitError('Rate limit of 10 requests every 60 seconds exceeded.')
  }

  console.log('cwd', process.cwd())

  // const countriesJSONPath = join(process.cwd(), 'data', 'countries.json')
  // if (!existsSync(countriesJSONPath)) {
  //   return []
  // }

  res.setHeader('Cache-Control', 'maxage=86400, s-maxage=86400, stale-while-revalidate')

  // const countries: any[] = JSON.parse(readFileSync(countriesJSONPath).toString())
  // const countries: any[] = require('../../../data/countries.json')
  return countries
})