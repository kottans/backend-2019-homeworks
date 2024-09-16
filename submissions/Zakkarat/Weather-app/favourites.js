const fs = require('fs');

const writeToFav = location => {
  fs.writeFile('./favourites.txt', location.join('\n'), err => {
    if (err) {
      return console.log(err);
    }
  });
};

const readFav = () => {
  try {
    return fs.readFileSync('./favourites.txt', (err, data) => {
      if (err) throw err;
      return data;
    });
  } catch {
    return '';
  }
};

const toggleFav = loc => {
  const data = readFav()
    .toString()
    .split('\n')
    .map(elem => elem.toLowerCase());
  if (!data.includes(loc)) {
    data.push(loc);
  } else {
    data.splice(data.indexOf(loc), 1);
  }
  writeToFav(data);
};

module.exports = { toggleFav, readFav };
