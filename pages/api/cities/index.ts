import { NextApiRequest, NextApiResponse } from 'next'
import requestHandler from '../../../libs/requestHandler'
import { BadRequestError, RateLimitError } from '../../../libs/errors'
import RateLimit from '../../../libs/rateLimit'
import getIpAddress from '../../../libs/getIpAddress'
import fs from 'fs'
import path from 'path'

const rateLimit = new RateLimit(1000, 60 * 1000)

export default requestHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  const countryCode = req.query.countryCode as string
  const stateCode = req.query.stateCode as string

  if (!countryCode && !stateCode) {
    throw new BadRequestError('Either query countryCode or stateCode is required.')
  }

  if (!rateLimit.limit(res, `ip:${getIpAddress(req)},url:/api/cities`, 10)) {
    throw new RateLimitError('Rate limit of 10 requests every 60 seconds exceeded.')
  }

  const citiesJSONPath = path.join(process.cwd(), 'data', 'cities.json')
  if (!fs.existsSync(citiesJSONPath)) {
    return []
  }

  const cities: any[] = JSON.parse(fs.readFileSync(citiesJSONPath).toString())
  if (countryCode) {
    res.setHeader('Cache-Control', 'maxage=86400, s-maxage=86400, stale-while-revalidate')

    return cities.filter(city => city.countryCode === countryCode)
  } else if (stateCode) {
    res.setHeader('Cache-Control', 'maxage=86400, s-maxage=86400, stale-while-revalidate')

    return cities.filter(city => city.stateCode === stateCode)
  } else {
    throw new BadRequestError()
  }
})