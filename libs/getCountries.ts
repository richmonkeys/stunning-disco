import orderBy from 'lodash/orderBy'
import axiosInstance from './axiosInstance'

const getCountries = async () => {
  console.log('Refreshing countries')
  const countriesJSON = await axiosInstance.get<any[]>('https://raw.githubusercontent.com/dr5hn/countries-states-cities-database/master/countries.json')
  const countryInfoJSON = await axiosInstance.get<any>('http://api.geonames.org/countryInfoJSON', {
    params: { username: process.env.GEONAMES_USERNAME },
  })
  const currenciesJSON = await axiosInstance.get<any>('https://openexchangerates.org/api/currencies.json')

  const countries = countriesJSON.data.map(country => {
    const countryInfo = countryInfoJSON.data.geonames.find(geoname => geoname.countryCode === country.iso2)
    const currencyName = currenciesJSON.data[countryInfo.currencyCode]
    return {
      countryName: countryInfo.countryName,
      countryCode: countryInfo.countryCode,
      countryNameTranslations: country.translations,
      nativeCountryName: country.native,
      continentCode: countryInfo.continent,
      continentName: countryInfo.continentName,
      capital: countryInfo.capital,
      isoAlpha3: countryInfo.isoAlpha3,
      isoNumeric: countryInfo.isoNumeric,
      areaInSqKm: isNaN(Number(countryInfo.areaInSqKm)) ? countryInfo.areaInSqKm : Number(countryInfo.areaInSqKm),
      fipsCode: countryInfo.fipsCode,
      languageCodes: countryInfo.languages.split(','),
      currencyCode: countryInfo.currencyCode,
      currencyName,
      currencySymbol: country.currency_symbol,
      postalCodeFormat: countryInfo.postalCodeFormat,
      'e.164': country.phone_code,
      timezones: country.timezones.map(timezone => ({
        timezone: timezone.zoneName,
        name: timezone.tzName,
        abbreviation: timezone.abbreviation,
        gmtOffset: timezone.gmtOffset,
        gmtOffsetName: timezone.gmtOffsetName,
      })),
      latitude: country.latitude,
      longitude: country.longitude,
      population: isNaN(Number(countryInfo.population)) ? countryInfo.population : Number(countryInfo.population),
      north: countryInfo.north,
      east: countryInfo.east,
      south: countryInfo.south,
      west: countryInfo.west,
      emoji: country.emoji,
      emojiUnicode: country.emojiU,
    }
  })

  return orderBy(countries, 'countryCode')
}

export default getCountries