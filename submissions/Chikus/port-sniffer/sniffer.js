const Net = require('net');

const help = `
TCP sniffer parameters:
    --host     Mandatory parameter which define the host address for a TCP
               port, It can be specified as IP address or URL.
    --ports    Optional parameter which specifies port range, from min (1) to
               max (65536) with a separator '-' between them, if this is not specified will
               take the min and max values.

Examples: node sniffer.js --host google.com --ports 100-2345
          node sniffer.js --ports 1-1500 --host www.google.com
          node sniffer.js --host 171.217.3.110
          node sniffer.js --ports 70-80 --host 171.217.3.110
          node sniffer.js --host www.google.com
`;

function checkServer(host, port) {
  return new Promise(function prom(resolve, reject) {
    const socket = Net.createConnection(port, host);
    socket.setTimeout(300);
    socket.on('timeout', function timer() {
      socket.destroy();
      resolve(null);
    });
    socket.on('connect', function success() {
      process.stdout.write('.');
      socket.destroy();
      resolve(port);
    });
    socket.on('error', function fail() {
      socket.destroy();
      reject(new Error('Wrong host please type: node sniffer.js --help'));
    });
  }).catch(e => {
    throw e;
  });
}

async function runPorts(host, lowerPort, higherPort) {
  const portList = [];
  for (let i = lowerPort; i <= higherPort; i += 1) {
    /* eslint-disable no-await-in-loop */
    const validPort = await checkServer(host, i);
    if (validPort) {
      portList.push(validPort);
    }
  }
  if (portList.length) {
    process.stdout.write(`\n${portList.join()} ports are opened \n`);
    return process.exit(0);
  }
  process.stdout.write('No ports were found \n');
  return process.exit(0);
}

function checkPorts(userPorts) {
  if (userPorts) {
    const ports = userPorts.split('-').map(elem => Number(elem));
    if (ports[0] > ports[1] || ports[0] < 0 || ports[1] > 65535 || !ports[1]) {
      throw new Error(' Check your ports, range from 1-65535\n');
    }
    return [ports[0], ports[1]];
  }
  throw new Error('Ports no defined \n');
}

function checkHost(host) {
  if (host) {
    const domains = host.split('.');
    if (host.replace(/[^.]/g, '').length === 3) {
      if (
        domains.every(x => Number.isNaN(x)) ||
        domains.every(x => !Number.isNaN(x))
      ) {
        return host;
      }
    } else if (host.replace(/[^.]/g, '').length <= 2) {
      if (domains.every(x => !Number.isNaN(x))) {
        return host;
      }
    }
  }
  return null;
}

function parseArguments(args) {
  const parsedArgs = args.slice(2).reduce(
    (acc, arg) => {
      if (arg.startsWith('--') && !acc.lastKey) {
        acc.lastKey = arg.replace('--', '');
      } else if (acc.lastKey) {
        acc.result = { ...acc.result, [acc.lastKey]: arg };
        acc.lastKey = null;
      } else {
        throw new Error(`'Unexpected argument '${arg}`);
      }
      return acc;
    },
    { result: {}, lastKey: null }
  ).result;
  if (parsedArgs.lastKey) {
    throw new Error(`Unexpected key '${parsedArgs.lastKey}' no value`);
  }
  return parsedArgs;
}

function sniffer(arg) {
  if (arg.includes('--help')) {
    process.stdout.write(help);
  } else if (arg.length > 6) {
    throw new Error('Bad usage type: node sniffer.js --help');
  } else {
    const args = parseArguments(arg);
    const [portMin, portMax] = checkPorts(args.ports);
    runPorts(checkHost(args.host), portMin, portMax);
  }
}
sniffer(process.argv);
