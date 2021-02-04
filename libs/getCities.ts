import axiosInstance from './axiosInstance'
import orderBy from 'lodash/orderBy'

const getCities = async () => {
  console.log('Refreshing cities')
  const citiesJSON = await axiosInstance.get<any[]>('https://raw.githubusercontent.com/dr5hn/countries-states-cities-database/master/cities.json')

  const cities = citiesJSON.data.map(city => {
    return {
      cityName: city.name,
      countryCode: city.country_code,
      stateCode: `${city.country_code}-${city.state_code}`,
      latitude: city.latitude,
      longitude: city.longitude,
    }
  })

  return orderBy(cities, ['countryCode', 'stateCode'])
}

export default getCities