import { NextApiRequest, NextApiResponse } from 'next'
import requestHandler from '../../../libs/requestHandler'
import getIpAddress from '../../../libs/getIpAddress'
import RateLimit from '../../../libs/rateLimit'
import { RateLimitError } from '../../../libs/errors'
import set from 'lodash/set'
import get from 'lodash/get'
import getCountries from '../../../libs/getCountries'

const rateLimit = new RateLimit(1000, 60 * 1000)

export default requestHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  if (!rateLimit.limit(res, `ip:${getIpAddress(req)},url:/api/currencies`, 10)) {
    throw new RateLimitError('Rate limit of 10 requests every 60 seconds exceeded.')
  }

  const countries = await getCountries()

  return Object.values(countries.reduce((currencies, country) => {
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
  }, {}))
})