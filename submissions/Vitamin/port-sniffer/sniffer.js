const Net = require('net');
const dns = require('dns').promises;
const { help, isDefined } = require('./helpers');

const [, , ...processArgs] = process.argv;
const [minPortValue, maxPortValue] = [0, 65535];

const ipFromHostname = async host => {
  try {
    const result = await dns.lookup(host);
    return result.address;
  } catch (err) {
    throw Error('Invalid host');
  }
};

const isPortInRange = port => port >= minPortValue && port <= maxPortValue;

// eslint-disable-next-line consistent-return
const getPortsRange = ports => {
  const [firstPort, last] = ports.split('-');
  const lastPort = isPortInRange(last) ? last : firstPort;
  if (isPortInRange(firstPort)) {
    return [firstPort, lastPort];
  }
  console.log('Invalid ports range');
};

const tryToConnect = (host, port) => {
  const client = new Net.Socket();
  client.setTimeout(300);
  client.connect({ port, host });
  return new Promise(resolve => {
    client.on('connect', () => {
      process.stdout.write('.');
      client.destroy();
      return resolve(port);
    });
    client.on('timeout', () => {
      client.destroy();
      return resolve(null);
    });
    client.on('error', () => {
      client.destroy();
      return resolve(null);
    });
  });
};

const getOpenedPorts = async ({ host, firstPort, lastPort }) => {
  const promises = [];
  // eslint-disable-next-line no-plusplus
  for (let i = firstPort; i <= lastPort; i++) {
    promises.push(tryToConnect(host, i));
  }
  const ports = await Promise.all(promises);
  return ports.filter(isDefined);
};

const parseArguments = async args => {
  if (args.includes('--help')) {
    console.log(help);
    process.exit(0);
  } else if (
    args.length < 4 ||
    !args.includes('--ports') ||
    !args.includes('--host')
  ) {
    console.log('Use --help to correct input');
    process.exit(1);
  }
  const [firstPort, lastPort] = getPortsRange(args[1]);
  const host = await ipFromHostname(args[3]);
  return { host, firstPort, lastPort };
};

const getMessageToLog = openPorts => {
  let result;
  if (openPorts.length > 1) {
    result = `\n${openPorts} ports are opened`;
  } else if (openPorts.length === 1) {
    result = `\n${openPorts} port is opened`;
  } else {
    result = '\nAll ports in range are closed';
  }
  return result;
};

const sniff = async args => {
  const { host, firstPort, lastPort } = await parseArguments(args);
  return getOpenedPorts({ host, firstPort, lastPort });
};

sniff(processArgs)
  .then(getMessageToLog)
  .then(console.log);
