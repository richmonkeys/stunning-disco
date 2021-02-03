const fs = require('fs')
const path = require('path')
const axios = require('axios').default
const addDate = require('date-fns/add')

const fetchRawCountryInfoJSON = async () => {
  const filePath = path.join('data', 'raw', 'countryInfo', 'data.json')
  const fileAbsolutePath = path.join(process.cwd(), filePath)
  if (fs.existsSync(fileAbsolutePath)) {
    const stat = fs.statSync(fileAbsolutePath)
    if (addDate(stat.mtime, { days: 1 }) > new Date()) {
      // console.log('Loaded', filePath, 'from cache')
      return
    }
  }

  const writer = fs.createWriteStream(fileAbsolutePath, { flags: 'w' })
  const start = Date.now()
  console.log('Refreshing', filePath)
  const response = await axios.get('http://api.geonames.org/countryInfoJSON', {
    params: { username: process.env.GEONAMES_USERNAME },
    responseType: 'stream',
  })

  await new Promise((resolve, reject) => {
    response.data.pipe(writer)
    let error = null
    writer.on('error', err => {
      error = err
      writer.close()
      reject(err)
    })
    writer.on('close', () => {
      if (!error) {
        console.log('Successfully refreshed', filePath, 'in', `${Date.now() - start}ms`)
        resolve(true)
      }
    })
  })
}

module.exports = fetchRawCountryInfoJSON