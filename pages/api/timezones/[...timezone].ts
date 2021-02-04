import { NextApiRequest, NextApiResponse } from 'next'
import requestHandler from '../../../libs/requestHandler'
import RateLimit from '../../../libs/rateLimit'
import { NotFoundError, RateLimitError } from '../../../libs/errors'
import getIpAddress from '../../../libs/getIpAddress'
import set from 'lodash/set'
import get from 'lodash/get'
import resolveFile from '../../../libs/resolveFile'

const rateLimit = new RateLimit(1000, 60 * 1000)

export default requestHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  const timezone = (req.query.timezone as string[]).join('/')

  if (!rateLimit.limit(res, `ip:${getIpAddress(req)},url:/api/timezones/[...timezone]`, 10)) {
    throw new RateLimitError('Rate limit of 10 requests every 60 seconds exceeded.')
  }

  const countries: any[] = JSON.parse(resolveFile('data', 'tmp', 'countries.json').toString())
  // const countries: any[] = require('../../../data/countries.json')
  const timezones = countries.reduce((timezones, country) => {
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
  }, {})
  const tz = timezones[timezone]

  if (!tz) {
    throw new NotFoundError()
  }

  res.setHeader('Cache-Control', 'maxage=86400, s-maxage=86400, stale-while-revalidate')

  return tz
})