'use strict';

const { showWeather } = require('./showWeather');

const argv = require('yargs')
  .option('range', {
    alias: 'r',
    type: 'string'
  })
  .option('location', {
    alias: 'l',
    type: 'string'
  })
  .option('units', {
    alias: 'u',
    type: 'string'
  }).argv;

const mode = argv.range === 'week' ? 'forecast' : 'weather';
const units = argv.units === 'farenheit' ? 'imperial' : 'metric';

showWeather(mode, argv.location || '', units);
