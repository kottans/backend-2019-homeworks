const rl = require('readline-sync');
const { getRecent, getFavourite } = require('./manageCities');

function selectRecent () {
  const recent = getRecent();
  const option = rl.keyInSelect(recent, 'Select');
  return option === -1 ? '' : recent[option];
}

function selectFavourite () {
  const favourite = getFavourite().map(city => city.name);
  const option = rl.keyInSelect(favourite, 'Select');
  return option === -1 ? '' : favourite[option];
}

module.exports.wrongCity = async function (name) {
  const options = ['Select city form recent', 'Select city from favourite', 'Enter city'];
  process.stdout.write(name ? `There is no weather data for the city with the name ${name}\n`
    : 'There is no city name provided\n');
  process.stdout.write('Would you like to');
  const option = rl.keyInSelect(options, 'Select');
  switch (option) {
    case 0:
      return selectRecent();
    case 1:
      return selectFavourite();
    case 2:
      return rl.question('Enter city name: ');
    case -1:
      process.exit(0);
  }
};
