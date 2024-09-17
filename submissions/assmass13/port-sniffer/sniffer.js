const dns = require('dns');
const { Socket } = require('net');

const defaultPortLimits = {
  startPort: 0,
  endPort: 65535
};
const timeout = 300;

const helpMessage = `Sniffer params usage:
--host - required argument which can be either domain name, like google.com or IP address like 172.217.3.110
--ports - limits range of ports to scan, should be provided in format (start_port)-(end_port), for instance: 3-600
--help - flag to see hint about how to use TCP sniffer\n`;
const hostErrorMessage = `--host parameter with its value should be passed\n`;
const portsErrorMessage = `--ports value should be passed as a port range with limits(0-65535), like 15-333\n`;
function lookupErrorMessage(error) {
  return `Error ${error.code} occurred during ${error.syscall} call for '${error.hostname}' host\n`;
}

function stdoutWrite(str) {
  process.stdout.write(str);
}

function exit(code) {
  process.exit(code);
}

function parseArgs(args) {
  if (args.includes('--help')) {
    stdoutWrite(helpMessage);
    exit(0);
  } else if (
    args.indexOf('--host') === -1 ||
    !args[args.indexOf('--host') + 1]
  ) {
    stdoutWrite(hostErrorMessage);
    exit(1);
  }

  return args.reduce((result, item, index, arr) => {
    if (item.indexOf('--') === 0 && arr[index + 1]) {
      return { ...result, [item]: arr[index + 1] };
    }
    return result;
  }, {});
}

async function getAddress(host) {
  return new Promise((resolve, reject) => {
    dns.lookup(host, (err, address) => {
      if (err) reject(err);
      resolve(address);
    });
  }).catch(e => {
    stdoutWrite(lookupErrorMessage(e));
    exit(1);
  });
}

function getPortLimits(portsRange) {
  const arePortsValid = ports =>
    ports.length === 2 &&
    ports[0] >= defaultPortLimits.startPort &&
    ports[1] > ports[0] &&
    ports[1] <= defaultPortLimits.endPort;

  const portArr = portsRange.split('-').map(portNum => parseInt(portNum, 10));

  if (!arePortsValid(portArr)) {
    stdoutWrite(portsErrorMessage);
    exit(1);
  }
  return { startPort: portArr[0], endPort: portArr[1] };
}

async function scanAddressPort(address, port) {
  return new Promise(resolve => {
    const socket = new Socket();
    socket.setTimeout(timeout);

    socket.on('connect', () => {
      stdoutWrite('.');
      resolve(port);
      socket.destroy();
    });

    socket.on('timeout', () => {
      resolve(false);
      socket.destroy();
    });

    socket.on('error', () => {
      resolve(false);
      socket.destroy();
    });

    socket.connect(port, address);
  });
}

function getAddressOpenPorts(address, startPort, endPort) {
  const openPorts = [];
  for (let port = startPort; port < endPort; port += 1) {
    openPorts.push(scanAddressPort(address, port));
  }
  return Promise.all(openPorts).then(values => values.filter(Number.isFinite));
}

(async function sniff() {
  const processArgs = process.argv.slice(2);
  const parsedArgs = parseArgs(processArgs);
  const address = await getAddress(parsedArgs['--host']);
  const portLimits =
    '--ports' in parsedArgs
      ? getPortLimits(parsedArgs['--ports'])
      : defaultPortLimits;
  const openPorts = await getAddressOpenPorts(
    address,
    portLimits.startPort,
    portLimits.endPort
  );
  if (openPorts.length > 0) {
    stdoutWrite(`\n${openPorts.join(', ')} ports are opened\n`);
  } else {
    stdoutWrite('No opened ports\n');
  }
})();
