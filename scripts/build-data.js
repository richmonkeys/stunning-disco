const fs = require('fs')
const path = require('path')
const axios = require('axios').default
const addDate = require('date-fns/add')
const orderBy = require('lodash/orderBy')

const BASE_DIR = ['node_modules', '@richmonkeys', '.stunning-disco']

/**
 * 
 * @param {string} url 
 * @param {object} axiosConfig 
 * @param {string} filename 
 * @param {string[]} dirname 
 */
const getRemoteFile = async (url, filename, axiosConfig = {}, dirname = []) => {
  const dir = path.join(process.cwd(), ...BASE_DIR, ...dirname)
  const absolutePath = path.join(dir, filename)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  if (fs.existsSync(absolutePath)) {
    const stat = fs.statSync(absolutePath)
    if (addDate(stat.mtime, { days: 1 }) > new Date()) {
      console.log('Loaded', filename, 'from cache', absolutePath)
      return JSON.parse(fs.readFileSync(absolutePath).toString())
    }
  }

  const start = Date.now()
  console.log('Refreshing', absolutePath)
  const response = await axios.get(url, axiosConfig)
  fs.writeFileSync(absolutePath, JSON.stringify(response.data))
  console.log('Successfully refreshed', absolutePath, 'in', `${Date.now() - start}ms`)

  return response.data
}

const buildCountriesJSON = async (filename = 'countries.json', dirname = []) => {
  const dir = path.join(process.cwd(), ...BASE_DIR, ...dirname)
  const absolutePath = path.join(dir, filename)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  if (fs.existsSync(absolutePath)) {
    const stat = fs.statSync(absolutePath)
    if (addDate(stat.mtime, { days: 1 }) > new Date()) {
      console.log('Loaded', filename, 'from cache', absolutePath)
      return JSON.parse(fs.readFileSync(absolutePath).toString())
    }
  }

  const countriesJSON = await getRemoteFile('https://raw.githubusercontent.com/dr5hn/countries-states-cities-database/master/countries.json', 'raw.countries.json')
  const countryInfoJSON = await getRemoteFile('http://api.geonames.org/countryInfoJSON', 'raw.countryInfo.json', {
    params: { username: process.env.GEONAMES_USERNAME },
  })
  const currenciesJSON = await getRemoteFile('https://openexchangerates.org/api/currencies.json', 'raw.currencies.json')

  const countries = countriesJSON.map(country => {
    const countryInfo = countryInfoJSON.geonames.find(geoname => geoname.countryCode === country.iso2)
    const currencyName = currenciesJSON[countryInfo.currencyCode]
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
  fs.writeFileSync(absolutePath, JSON.stringify(ordered))
}

const buildStatesJSON = async (filename = 'states.json', dirname = []) => {
  const dir = path.join(process.cwd(), ...BASE_DIR, ...dirname)
  const absolutePath = path.join(dir, filename)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  if (fs.existsSync(absolutePath)) {
    const stat = fs.statSync(absolutePath)
    if (addDate(stat.mtime, { days: 1 }) > new Date()) {
      console.log('Loaded', filename, 'from cache', absolutePath)
      return JSON.parse(fs.readFileSync(absolutePath).toString())
    }
  }

  const statesJSON = await getRemoteFile('https://raw.githubusercontent.com/dr5hn/countries-states-cities-database/master/states.json', 'raw.states.json')

  const states = statesJSON.map(state => {
    return {
      stateName: state.name,
      stateCode: `${state.country_code}-${state.state_code}`,
      countryCode: state.country_code,
      latitude: state.latitude,
      longitude: state.longitude,
    }
  })

  const ordered = orderBy(states, ['stateCode'])
  fs.writeFileSync(absolutePath, JSON.stringify(ordered))
}

const buildCitiesJSON = async (filename = 'cities.json', dirname = []) => {
  const dir = path.join(process.cwd(), ...BASE_DIR, ...dirname)
  const absolutePath = path.join(dir, filename)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  if (fs.existsSync(absolutePath)) {
    const stat = fs.statSync(absolutePath)
    if (addDate(stat.mtime, { days: 1 }) > new Date()) {
      console.log('Loaded', filename, 'from cache', absolutePath)
      return JSON.parse(fs.readFileSync(absolutePath).toString())
    }
  }

  const citiesJSON = await getRemoteFile('https://raw.githubusercontent.com/dr5hn/countries-states-cities-database/master/cities.json', 'raw.cities.json')

  const cities = citiesJSON.map(city => {
    return {
      cityName: city.name,
      countryCode: city.country_code,
      stateCode: `${city.country_code}-${city.state_code}`,
      latitude: city.latitude,
      longitude: city.longitude,
    }
  })

  const ordered = orderBy(cities, ['countryCode', 'stateCode'])
  fs.writeFileSync(absolutePath, JSON.stringify(ordered))
}

const buildData = async () => {
  await buildCountriesJSON()
  await buildStatesJSON()
  await buildCitiesJSON()
}

(async () => {
  await buildData()
})()

// buildData()
//   .then(() => {
//     process.exit(1)
//   })
//   .catch(error => {
//     console.error(error)
//     process.exit(1)
//   })