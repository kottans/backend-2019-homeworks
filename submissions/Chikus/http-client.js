/* eslint prefer-destructuring: ["error", {AssignmentExpression: {array: false}}] */
const http = require('http');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin
});

let verbo = false;

rl.on('line', function inputConsole(line) {
  const sline = line.split(' ');
  let data = '';
  let ifc = '';
  let len;
  let method = '';
  if (sline[1]) len = sline[1].length;
  if (line.includes('verbose')) verbo = true;
  if (sline.length > 4) {
    throw new Error('Error in the operation check syntax');
  }
  if (line.includes('push') || line.includes('pop')) {
    ifc = 'stack';
    if (sline[0] === 'push') {
      method = 'POST';
      data = sline[1];
    }
    if (sline[0] === 'pop') {
      method = 'DELETE';
      len = 0;
    }
  } else if (
    line.includes('insert') ||
    line.includes('remove') ||
    line.includes('show')
  ) {
    ifc = 'linkedlist';
    if (sline[0] === 'insert') {
      method = 'POST';
      data = line;
      len = line.length;
    }
    if (sline[0] === 'show') {
      method = 'GET';
      len = 0;
    }
    if (sline[0] === 'remove') {
      method = 'DELETE';
      data = sline[1];
    }
  } else {
    throw new Error('Error in the operation check syntax');
  }

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: `/api/${ifc}`,
    method: `${method}`,
    headers: {
      'Content-Type': 'text/plain',
      'Content-Length': `${len}`
    }
  };

  const req = http.request(options, res => {
    res.on('data', chunk => {
      process.stdout.write(`${chunk}\n`);
    });
    res.on('end', () => {
      if (verbo) process.stdout.write('Success');
    });
  });

  req.on('error', e => {
    process.stdout.write(`problem with request: ${e.message}`);
  });
  req.write(`${data}`);
  req.end();
});
