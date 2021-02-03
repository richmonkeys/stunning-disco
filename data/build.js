const buildData = () => {
  // .then(() => require('./raw/countryInfo/fetch.js')())
  // .then(() => require('./raw/countries/fetch.js')())
  // .then(() => require('./raw/states/fetch.js')())
  // .then(() => require('./raw/cities/fetch.js')())
  // .then(() => require('./raw/currencies/fetch.js')())
  Promise.resolve()
    .then(() => require('./build.countries.json.js')())
    .then(() => require('./build.states.json.js')())
    .then(() => require('./build.cities.json.js')())
}

buildData()