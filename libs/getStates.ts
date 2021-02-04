import axiosInstance from './axiosInstance'
import orderBy from 'lodash/orderBy'

const getStates = async () => {
  console.log('Refreshing states')
  const statesJSON = await axiosInstance.get<any[]>('https://raw.githubusercontent.com/dr5hn/countries-states-cities-database/master/states.json')

  const states = statesJSON.data.map(state => {
    return {
      stateName: state.name,
      stateCode: `${state.country_code}-${state.state_code}`,
      countryCode: state.country_code,
      latitude: state.latitude,
      longitude: state.longitude,
    }
  })

  return orderBy(states, ['stateCode'])
}

export default getStates