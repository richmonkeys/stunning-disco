const fs = require('fs')
const path = require('path')
const addDate = require('date-fns/add')
const orderBy = require('lodash/orderBy')

const buildStatesJSON = async () => {
  const filePath = path.join('data', 'states.json')
  const fileAbsolutePath = path.join(process.cwd(), filePath)
  if (fs.existsSync(fileAbsolutePath)) {
    const stat = fs.statSync(fileAbsolutePath)
    if (addDate(stat.mtime, { days: 1 }) > new Date()) {
      // console.log('Loaded', filePath, 'from cache')
      return
    }
  }

  await require('./raw/states/fetch')()

  const rawStatesJSON = require('./raw/states/data.json')

  const states = rawStatesJSON.map(state => {
    return {
      stateName: state.name,
      stateCode: `${state.country_code}-${state.state_code}`,
      countryCode: state.country_code,
      latitude: state.latitude,
      longitude: state.longitude,
    }
  })

  const ordered = orderBy(states, ['stateCode'])

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

module.exports = buildStatesJSON