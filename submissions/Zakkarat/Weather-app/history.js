const fs = require('fs');

const writeToHistory = location => {
  fs.appendFile('./history.txt', location, err => {
    if (err) {
      return console.log(err);
    }
  });
};

const readHistory = () => {
  try {
    return fs.readFileSync('./history.txt', (err, data) => {
      if (err) throw err;
      return data.toString();
    });
  } catch {
    console.log('No history yet.');
  }
};

module.exports = { writeToHistory, readHistory };
