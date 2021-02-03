const fs = require('fs')
const path = require('path')
const addDate = require('date-fns/add')
const orderBy = require('lodash/orderBy')

const buildCitiesJSON = async () => {
  const filePath = path.join('data', 'cities.json')
  const fileAbsolutePath = path.join(process.cwd(), filePath)
  if (fs.existsSync(fileAbsolutePath)) {
    const stat = fs.statSync(fileAbsolutePath)
    if (addDate(stat.mtime, { days: 1 }) > new Date()) {
      // console.log('Loaded', filePath, 'from cache')
      return
    }
  }

  await require('./raw/cities/fetch')()

  const rawPath = path.join(process.cwd(), 'data', 'raw', 'cities', 'data.json')
  if (!fs.existsSync(rawPath)) {
    return
  }
  const rawCitiesJSON = JSON.parse(fs.readFileSync(rawPath).toString())

  const cities = rawCitiesJSON.map(city => {
    return {
      cityName: city.name,
      countryCode: city.country_code,
      stateCode: `${city.country_code}-${city.state_code}`,
      latitude: city.latitude,
      longitude: city.longitude,
    }
  })

  const ordered = orderBy(cities, ['countryCode', 'stateCode'])

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

module.exports = buildCitiesJSON