const fs = require('fs')
const path = require('path')
const addDate = require('date-fns/add')
const orderBy = require('lodash/orderBy')

const buildCountriesJSON = async () => {
  const filePath = path.join('data', 'countries.json')
  const fileAbsolutePath = path.join(process.cwd(), filePath)
  if (fs.existsSync(fileAbsolutePath)) {
    const stat = fs.statSync(fileAbsolutePath)
    if (addDate(stat.mtime, { days: 1 }) > new Date()) {
      // console.log('Loaded', filePath, 'from cache')
      return
    }
  }

  await require('./raw/countries/fetch')()
  await require('./raw/countryInfo/fetch')()
  await require('./raw/currencies/fetch')()

  const rawCountriesJSON = require('./raw/countries/data.json')
  const rawCountryInfoJSON = require('./raw/countryInfo/data.json')
  const rawCurrenciesJSON = require('./raw/currencies/data.json')

  const countries = rawCountriesJSON.map(country => {
    const countryInfo = rawCountryInfoJSON.geonames.find(geoname => geoname.countryCode === country.iso2)
    const currencyName = rawCurrenciesJSON[countryInfo.currencyCode]
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

  const ordered = orderBy(countries, 'countryCode')

  await new Promise((resolve, reject) => {
    const start = Date.now()
    console.log('Building', filePath)
    fs.writeFile(fileAbsolutePath, JSON.stringify(ordered), 'utf8', error => {
      if (error) {
        reject(error)
      } else {
        console.log('Successfully built', filePath, 'in', `${Date.now() - start}ms`)
        resolve(true)
      }
    })
  })
}

module.exports = buildCountriesJSON