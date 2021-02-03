import { NextApiRequest, NextApiResponse } from 'next'
import requestHandler from '../../../libs/requestHandler'
import getIpAddress from '../../../libs/getIpAddress'
import RateLimit from '../../../libs/rateLimit'
import { RateLimitError } from '../../../libs/errors'
import fs from 'fs'
import path from 'path'

const rateLimit = new RateLimit(1000, 60 * 1000)

export default requestHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  res.setHeader('Cache-Control', 'maxage=86400, s-maxage=86400, stale-while-revalidate')

  if (!rateLimit.limit(res, `ip:${getIpAddress(req)},url:/api/countries`, 10)) {
    throw new RateLimitError('Rate limit of 10 requests every 60 seconds exceeded.')
  }

  // console.log('cwd', process.cwd())

  // const countriesJSONPath = path.join(process.cwd(), 'data', 'countries.json')
  // if (!fs.existsSync(countriesJSONPath)) {
  //   return []
  // }

  return 1

  // const countries: any[] = JSON.parse(fs.readFileSync(countriesJSONPath).toString())
  // // const countries: any[] = require('../../../data/countries.json')
  // return countries
})