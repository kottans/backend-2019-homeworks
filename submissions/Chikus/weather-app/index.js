let fs = require('fs');

const help =
`Simple weather application
This script takes 2 parameters:
--l(--location)     Parameter which defines the city where you want see forecast
           City must be specified after the parameter.
           If you start the program without providing any location, last successful query will be repeated.
           Example: node index.js --l=Kyiv
--r(--range)     Parameter which specifies forecast period.
           Range must be specified after the parameter.
           It can be specified as 'day' or 'week'.
           Default value = day.
           Example: node index.js --range=week
--help     Parameter will show this instructions. \n`;

const args = process.argv.splice(2,process.argv.length);
if (args.length > 2 || args.join(',').includes('--help')) {
  process.stdout.write(help);
  return 0;
}
const city = (args.join(',').includes('--l'))?args[args.findIndex(ele => ele.match('--l'))].split('=')[1]:fs.readFileSync('storecity','utf8').replace(/\r?\n|\r/,'');
if (city === '') throw new Error('Please provide a city \n');
const range = args.join(',').includes('week')?'forecast':'weather';
const options = {
  hostname: 'api.openweathermap.org',
  port: 443,
  path: `/data/2.5/${range}?q=${city}&appid=a5648b4f5b2e2989f059b602887ada85`,
  method: 'GET'
};
const req =require('https').request(options, (res) => {
  const displayA = [];
  res.on('data', (d) => {
    const obj = JSON.parse(d);
    if (res.statusCode >= 300) {
      throw new Error('City '+res.statusMessage+'\n');
    }
    else if (range === 'weather') {
      const display = {};
      display.COUNTRY = city+','+obj.sys.country;
      display.temp = obj.main.temp - 273.15;
      display.description = obj.weather[0].description;
      display.speed = obj.wind.speed;
      display.direction = obj.wind.deg;
      display.humid = obj.main.humidity;
      displayA.push(display);
    } else {
      displayA.push({COUNTRY:city+','+obj.city.country})
      for(let i = 1, j = 0; i < 39; i += 8) {
        displayA.push({DAY:'#######'+obj.list[i].dt_txt.split(' ')[0]+'######'})
        j = i;
        ['morning','noon','evening','night'].forEach(ele => {
            const display = {};
            display['temp_at_'+ele] = obj.list[j].main.temp - 273.15;
            display['description_at_'+ele] = obj.list[j].weather[0].description;
            display['speed_at_'+ele] = obj.list[j].wind.speed;
            display['direction_at_'+ele] = obj.list[j].wind.deg;
            display['humid_at_'+ele] = obj.list[j].main.humidity;
            displayA.push(display);
            j += 2;
          }
        )
      }
    }
    fs.writeFileSync('storecity',city);
  });
  res.on('end', ()=> {
    displayA.forEach(ele=>{
      for (key in ele){
        console.log( key + ": " + ele[key]);
      }
    })

  });
});
req.on('error', (e) => {
  console.error(e);
});
req.end();
