import { NextApiRequest, NextApiResponse } from 'next'
import requestHandler from '../../../libs/requestHandler'
import RateLimit from '../../../libs/rateLimit'
import { NotFoundError, RateLimitError } from '../../../libs/errors'
import getIpAddress from '../../../libs/getIpAddress'
import set from 'lodash/set'
import get from 'lodash/get'

const rateLimit = new RateLimit(1000, 60 * 1000)

export default requestHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  const currencyCode = req.query.currencyCode as string

  res.setHeader('Cache-Control', 'maxage=86400, s-maxage=86400, stale-while-revalidate')

  if (!rateLimit.limit(res, `ip:${getIpAddress(req)},url:/api/currencies/[currencyCode]`, 10)) {
    throw new RateLimitError('Rate limit of 10 requests every 60 seconds exceeded.')
  }

  const countries: any[] = require('../../../data/countries.json')
  const currency = countries.reduce((currencies, country) => {
    if (country.currencyCode && country.currencyName && country.currencySymbol) {
      set(currencies, `${country.currencyCode}.currencyName`, country.currencyName)
      set(currencies, `${country.currencyCode}.currencyCode`, country.currencyCode)
      set(currencies, `${country.currencyCode}.currencySymbol`, country.currencySymbol)
      const countries = get(currencies, `${country.currencyCode}.countries`, [])
      set(currencies, `${country.currencyCode}.countries`, [...countries, {
        countryCode: country.countryCode,
        countryName: country.countryName,
      }])
    }
    return currencies
  }, {})[currencyCode]

  if (!currency) {
    throw new NotFoundError()
  }

  return currency
})