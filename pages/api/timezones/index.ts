import { NextApiRequest, NextApiResponse } from 'next'
import requestHandler from '../../../libs/requestHandler'
import getIpAddress from '../../../libs/getIpAddress'
import RateLimit from '../../../libs/rateLimit'
import { RateLimitError } from '../../../libs/errors'
import set from 'lodash/set'
import get from 'lodash/get'
import resolveFile from '../../../libs/resolveFile'

const rateLimit = new RateLimit(1000, 60 * 1000)

export default requestHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  res.setHeader('Cache-Control', 'maxage=86400, s-maxage=86400, stale-while-revalidate')

  if (!rateLimit.limit(res, `ip:${getIpAddress(req)},url:/api/timezones`, 10)) {
    throw new RateLimitError('Rate limit of 10 requests every 60 seconds exceeded.')
  }

  const countries: any[] = JSON.parse(resolveFile('data', 'tmp', 'countries.json').toString())
  // const countries: any[] = require('../../../data/countries.json')

  return Object.values(countries.reduce((timezones, country) => {
    country.timezones.forEach((timezone: any) => {
      set(timezones, `${timezone.timezone}.timezone`, timezone.timezone)
      set(timezones, `${timezone.timezone}.name`, timezone.name)
      set(timezones, `${timezone.timezone}.abbreviation`, timezone.abbreviation)
      set(timezones, `${timezone.timezone}.gmtOffset`, timezone.gmtOffset)
      set(timezones, `${timezone.timezone}.gmtOffsetName`, timezone.gmtOffsetName)
      const countries = get(timezones, `${timezone.timezone}.countries`, [])
      set(timezones, `${timezone.timezone}.countries`, [...countries, {
        countryCode: country.countryCode,
        countryName: country.countryName,
      }])
    })
    return timezones
  }, {}))
})