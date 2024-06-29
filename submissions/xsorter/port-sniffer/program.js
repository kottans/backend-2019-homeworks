const mapLimit = require('async/mapLimit');
const net = require('net');
const dns = require('dns');
const args = require('minimist')(process.argv.slice(2));
const range = findPortsRange();

const ports = {
  portList: fillArrayRange((range[1] - range[0]) + 1, range[0]),
  firstPort: range[0],
  lastPort: range[1] ? range[1] : range[0],
  openedPorts: []
};

const openedPortCheck = (host, port, checkCallback) => {
  const socket = net.createConnection(port, host);
  const time = socket.setTimeout(300, () => {
    socket.destroy();
    checkCallback(false);
  });

  socket.on('connect', () => {
    clearTimeout(time);
    socket.destroy();
    console.log('.');
    ports.openedPorts.push(port);
    checkCallback(true);
  });
  socket.on('error', function () {
    clearTimeout(time);
    checkCallback(false);
  });
};

const showResult = host => {
  if (args.help) {
    console.table(messages().help);
    return false;
  }
  if (!args.host) {
    return false;
  } else {
    mapLimit(ports.portList, 10, async currentPort => {
      await openedPortCheck(host, currentPort, () => {
        if (currentPort === ports.lastPort) {
          if (ports.openedPorts.length) {
            console.table(
              messages(ports.openedPorts.join()).openedPorts
            );
            process.exit(0);
          } else {
            console.table(messages().portsNotFound);
            return false;
          }
        }
      });
    });
  }
};

function findPortsRange () {
  if (args.ports) {
    if (args.ports.length) {
      return args.ports.split('-').map(Number);
    } else {
      console.table(messages().emptyPortsParameter);
      return false;
    }
  } else {
    return [0, 65535];
  }
}

function messages (openedPortsNumbers) {
  return {
    help: `Port sniffer CLI tool. \n
    Parameters:
    --ports - type ports range
    --host - provide host IP adress or domain name \n
    Usage example: node program.js --ports 80-87 --host google.com`,
    noHost: 'Please provide host name. Type --help for usage manual.',
    openedPorts: `\nports ${openedPortsNumbers} are opened`,
    portsNotFound: 'No opened ports was found',
    emptyPortsParameter:
      'Please provide a port numbers range or skip --port parameter for default values (0-65535)'
  };
}

function fillArrayRange (arrLength, firstVal) {
  return Array.from(new Array(arrLength), (_, i) => (i + firstVal));
}

const ipLookup = () => {
  return new Promise((resolve, reject) => {
    dns.lookup(args.host, (err, address) => {
      if (err) reject(err);
      resolve(address);
    });
  });
};

ipLookup()
  .then(res => showResult(res))
  .catch(() => console.table('Adress not found'));
