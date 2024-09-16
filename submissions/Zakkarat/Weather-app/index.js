const fetcher = require('./dataFetcher');
const { celsium, days } = require('./dictionary.json');
const { writeToHistory, readHistory } = require('./history');
const { toggleFav, readFav } = require('./favourites');

const help = `
    This is simple CLI Weather App, which can show current weather or forecast for 5 days.
    There are parameters and values, to specify value for the parameter you should split them up
    with '='.
    For example: --l=Kiev 
    As a parameters, it takes:
        --l: Used to specify a location for a weather forecast. (Last successful request by default)
        --units: Used to specify units in which temperature will be given.
        Units for example: 'c', 'f'. (Faranheit by default)
        --r: Used to specify, whether you need a forecast or current weather.
        Example for current weather: 'current', 'curr' 'today'. (Forecast by default)
        --h: Used to show the history of requests.
        --f: To add location to your favourites list, you should use this parameter with a request.
        To remove location from the list, you should do exact same thing.
        To see the list, you should use parameter without request.
        --help: Shows this text.
`;

const main = async () => {
  const args = toFetchArgs(argsToObject());
  const argsKeys = Object.keys(args);
  const history = readHistory().toString();
  if (argsKeys.includes('h')) {
    console.log(history);
    return 0;
  }
  if (argsKeys.length === 2 && argsKeys.includes('f')) {
    console.log(readFav().toString());
    return 0;
  }
  if (argsKeys.includes('help')) {
    console.log(help);
    return 0;
  }
  if (!args.l) {
    args.l = history.split('\n')[history.split('\n').length - 1];
  }
  const data = await fetcher(args.l, args.units, args.r);
  data.list ? toConsoleSpec(data, args.l) : toConsoleCurr(data);
  if (argsKeys.includes('f')) {
    toggleFav(args.l);
  }
  if (argsKeys.includes('l')) {
    writeToHistory(args.l + '\n');
  }
  return data;
};

const argsToObject = () => {
  const args = process.argv
    .slice(2, process.argv.length)
    .map(elem => elem.split('='));
  return args.reduce((acc, curr) => {
    acc[curr[0].slice(2, curr[0].length)] = curr[1];
    return acc;
  }, {});
};

const toFetchArgs = args => {
  if (celsium.some(str => str === args.units)) {
    args.units = 'metric';
  } else {
    args.units = 'imperial';
  }
  if (args.l && args.l.includes(',')) {
    args.l = args.l.split(',');
  }
  return args;
};

const toConsoleCurr = data => {
  const { name, weather, main, wind, sys, dt } = data;
  const status = weather[0].main;
  const { temp } = main;
  const { speed } = wind;
  const { country } = sys;
  const date = new Date(dt * 1000);
  console.log(`${name} ${country} ${date.toDateString()}`);
  console.log(`Status: ${status}`);
  console.log(`Temperature: ${temp}`);
  console.log(`Wind speed: ${speed}`);
};

const toConsoleSpec = ({ list }, location) => {
  list.forEach(elem => (elem.dt = new Date(elem.dt * 1000)));
  list = list.filter(elem => !(list.indexOf(elem) % 9));
  console.log('------------------------');
  console.log('Day | Temp | Wind Speed ');
  console.log('------------------------');
  list.forEach(elem =>
    console.log(
      `${days[elem.dt.getDay()].slice(0, 3)} |  ${Math.floor(
        elem.main.temp
      )}  |      ${Math.floor(elem.wind.speed)}`
    )
  );
  console.log('------------------------');
};

main();
