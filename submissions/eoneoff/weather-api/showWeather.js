'use strict';

const { getWeather } = require('./getWeather');
const { icons } = require('./weatherIcons');
const { saveCities } = require('./manageCities');
const { wrongCity } = require('./wrongCity');
const Table = require('cli-table3');
const { cyan: c } = require('chalk');

function showBlocks (data, tUnit, wUnit) {
  for (const day of data) {
    dayBlock(day, tUnit, wUnit);
  }
}

function dayBlock (data, tUnit, wUnit) {
  const block = new Table({
    chars: {
      'top-mid': '─',
      'bottom-mid': '─',
      'left-mid': '',
      mid: '',
      'mid-mid': '',
      'right-mid': '',
      middle: ' '
    },
    colWidths: [17, 40]
  });
  block.push([icons[data.icon], weatherData(data, tUnit, wUnit)]);
  process.stdout.write(block.toString() + '\n');
}

function weatherData (data, tUnit, wUnit) {
  return `\n${c('Location:')} ${data.city}\n` +
    `${c('Date:')} ${data.date.toDateString()}\n` +
    `${c('Time')} ${data.date.toLocaleTimeString()}\n` +
    `${data.description}\n` +
    `${c('Temperature:')} ${data.temp}${tUnit}\n` +
    `${c('Maximum temperature:')} ${data.maxTemp}${tUnit}\n` +
    `${c('Minimum temperature:')} ${data.minTemp}${tUnit}\n` +
    `${c('Wind:')} ${windDirection(data.wind.deg)} ${data.wind.speed}${wUnit}\n`;
}

function windDirection (wind) {
  if (wind > 338 || wind < 22) return 'N';
  if (wind < 67) return 'NE';
  if (wind < 112) return 'E';
  if (wind < 157) return 'SE';
  if (wind < 202) return 'S';
  if (wind < 247) return 'SW';
  if (wind < 292) return 'W';
  return 'NW';
}

module.exports.showWeather = function showWeather (mode, location, units) {
  getWeather(mode, location, units).then(data => {
    showBlocks(data,
      units === 'imperial' ? 'F°' : 'C°',
      units === 'imperial' ? 'mph' : 'm/s',
      data.name);
    saveCities(location);
  }).catch(error => {
    const message = (error.response.data || {}).message;
    if (message === 'city not found' || message === 'Nothing to geocode') {
      wrongCity(location).then(c => showWeather(mode, c, units));
    } else throw (error);
  });
};
