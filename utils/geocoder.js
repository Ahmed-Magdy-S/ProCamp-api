const NodeGeocoder = require('node-geocoder');

const options = {
    provider: process.env.GEOCODER_PROVIDER,
    // Optional depending on the providers
    apiKey: process.env.GEOCODER_API_KEY,
    formatter: null
  };
  
  module.exports = NodeGeocoder(options);