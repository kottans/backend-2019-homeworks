'use strict';

const net = require('net');

function parseArgs () {
  const args = process.argv.slice(2);
  const parsed = {};
  let key = null;
  args.forEach(arg => {
    if (/^--/i.test(arg)) {
      key = arg.slice(2);
      parsed[key] = true;
    } else if (key) {
      parsed[key] = arg;
      key = null;
    }
  });
  return parsed;
}

function validateParams (params = {}) {
  if (params.help) {
    console.log(`Sniffer allows easily search for opened TCP ports on particular host

Usage: node sniffer.js --host <address> [--ports <start_port>-<end_port>] [--help]

Options:
    --help    Show this screen
    --host    Specify domain or ip of the host
    --ports   Specify range of ports to scan from 0 to 65535 in format lo-hi [default: 0-65535]`);
    return false;
  }
  if (!params.host || typeof params.host !== 'string') {
    console.log('host is required');
    return false;
  }
  if (params.ports) {
    if (!/^\d+-\d+$/.test(params.ports)) {
      console.log('invalid ports format');
      return false;
    }
    const ports = params.ports.split('-').map(port => parseInt(port));
    if (ports[0] > ports[1] || ports[1] > 65535) {
      console.log('invalid ports range');
      return false;
    }
  }
  return true;
}

function checkPort (host, port) {
  return new Promise(resolve => {
    const socket = net.createConnection({ host, port, timeout: 300 });
    socket.on('connect', () => {
      process.stdout.write('.');
      socket.end();
      resolve(port);
    });
    socket.on('timeout', () => {
      socket.destroy();
      resolve(null);
    });
    socket.on('error', () => {
      resolve(null);
    });
  });
}

function scanChunk (host, chunk) {
  return Promise.all(chunk.map(port => checkPort(host, port)));
}

function scan (host, ports = '0-65535') {
  const [start, end] = ports.split('-').map(port => parseInt(port));
  const arr = Array.from({ length: end - start + 1 }, (v, i) => i + start);
  const chunkSize = 100;
  let chain = Promise.resolve([]);
  for (let curr = 0; curr < arr.length; curr += chunkSize) {
    const chunk = arr.slice(curr, curr + chunkSize);
    chain = chain.then(prev => scanChunk(host, chunk).then(scanned => prev.concat(scanned)));
  }
  chain.then(results => {
    const opened = results.filter(port => port !== null);
    if (opened.length) {
      console.log('\nopened ports:', opened.join(', '));
    } else {
      console.log('no opened ports');
    }
  }).catch(err => {
    console.log('ports scan failed', err);
  });
}

const params = parseArgs();
if (validateParams(params)) {
  scan(params.host, params.ports);
}
