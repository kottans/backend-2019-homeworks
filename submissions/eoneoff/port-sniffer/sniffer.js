/* eslint-disable consistent-return */
/* eslint-disable no-return-await */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-console */
/* eslint-disable no-plusplus */
/* eslint-disable no-throw-literal */

const help = {
  script: `Simple port sniffer

This is a simple port sniffer, which can be called as command line script or imported as a module.
When used from command line it takes 2 named paramentes:
--host      obligatory parameter which defines the host address for a port scan.
            After the --host parameter should follow the host IP addres as four numbers,
            separated by commas or a host web address.

                node sniffer.js --host www.google.com

--ports     optional parementer to provide a port range for scan. The range
            should be defined as two number with a dash between them. If not set
            or set incorrectly the default range of (1-65535) is scanned

                node sniffer.js --host wwww.google.com --ports 1024-2018

--help      parameter to see this reference

To import port scanner use

    const sniffer = require('sniffer.js')

after import you can perform scan by calling sniffer.scan()

sniffer.scan(host[, portString][, args])

For detailed disambiguation on the function call sniffer.help()`,
  function: `Simple port scanning method

This is an async function for port scanning. It takes one obligatory argument 'host' and two
optional arguments 'portString', and additional arguments object 'args' with 'module' and
'silent' properties.

    sniffer.scan(host[, portString][, args])

host:str        an obligatory argument, which provies a host for scanning. It can be an
                IP address as string of four numbers, separated by dots or a hostname

posrtString:str an optional argument to define a range of scanned ports. Should be provided
                as a string, composed of two numbers, separated by dash. If not provided or
                provided incorrectly the port range will be set to default full range (1-65535)

args:Object                

    module:bool     a bool argument, which tells the function to run as a module, that is to
                    return a result as a list of open ports

    silent:bool     a bool argument, which tells the function to supress the output and run
                    in silent mode. Takes effect only if 'modlue' parameter is also set
                    to 'true'

The function is async and returns a promice. You shoud eather use it with await operator or
with then() method`
};

const dns = require('dns').promises;
const { Socket } = require('net');

function * twister () {
  const symbols = ['|', '/', '-', '\\'];
  let current = 0;
  while (true) {
    if (current === 4) current = 0;
    yield symbols[current++];
  }
}

function isIpAddress (address) {
  return (
    address.search(
      /^((25[0-5]|2[0-4]\d|[01]?\d?\d)\.){3}(25[0-5]|2[0-4]\d|[01]?\d?\d)$/
    ) === -1
  );
}

function isRange (ip) {
  return ip.search(/^\d{1,4}-\d{1,4}$/) === -1;
}

function isInvalidPortsRange (portsRange) {
  return (
    +portsRange[0] >= +portsRange[1] ||
    +portsRange[0] < 1 ||
    +portsRange[0] > 65535 ||
    +portsRange[1] < 1 ||
    +portsRange[1] > 65535
  );
}

async function parseHost (host) {
  if (isIpAddress(host)) {
    try {
      return (await dns.lookup(host)).address;
    } catch (err) {
      throw 'Hostname can not be resolved';
    }
  } else {
    return host;
  }
}

function parsePorts (ports) {
  if (isRange(ports)) {
    throw 'Invalid port range argument';
  } else {
    const limits = ports.split('-');
    if (isInvalidPortsRange(limits)) {
      throw 'Port numbers out of range';
    } else {
      limits[1]++;
      return limits;
    }
  }
}

async function parseArguments (args) {
  let host = '';
  let ports = [1, 65536];
  const hostIndex = args.indexOf('--host') + 1;
  if (hostIndex === 0 || hostIndex === args.length) {
    throw 'You must specify a host to scan ports';
  } else {
    host = await parseHost(args[hostIndex]);
  }
  const portsIndex = args.indexOf('--ports') + 1;
  if (portsIndex !== 0) {
    if (portsIndex === args.length) {
      console.log('Invalis ports specified, setting to default (1-65535)');
    } else {
      try {
        ports = parsePorts(args[portsIndex]);
      } catch (err) {
        console.log('Invalid ports specified, setting to default(1-65535)');
      }
    }
  }

  return { host, ports };
}

async function checkPort (host, port) {
  return new Promise(resolve => {
    const socket = new Socket();
    socket.setTimeout(300);
    socket.on('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.on('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.on('error', () => {
      socket.destroy();
      resolve(false);
    });
    socket.connect(port, host);
  });
}

async function scan (host, ports, args = { silent: false, module: false }) {
  const openPorts = [];
  const tw = twister();
  const scanAddress = checkPort.bind(undefined, host);
  process.stdout.write('scanning ');
  for (let port = +ports[0]; port < ports[1]; ++port) {
    process.stdout.write(`${tw.next().value}\b`);
    if (await scanAddress(port)) {
      openPorts.push(port);
      process.stdout.write('. ');
    }
  }

  if (!args.silent || !args.module) {
    console.log(
      ` \n${
        openPorts.length
          ? `Port${openPorts.length > 1 ? 's' : ''} ${openPorts.join(', ')} ${
              openPorts.length > 1 ? 'are' : 'is'
            }`
          : 'No ports are'
      } open`
    );
  }

  if (args.module) return openPorts;
}

module.exports.scan = async (
  host,
  ports = '',
  args = { module: true, silent: false }
) => await scan(await parseHost(host), parsePorts(ports), args);

module.exports.help = () => console.log(help.function);

if (process.argv.includes('--help')) {
  console.log(help.script);
} else {
  try {
    parseArguments(process.argv.slice(2)).then(result =>
      scan(result.host, result.ports)
    );
  } catch (err) {
    console.log(err);
    console.log('\n**********\n');
    console.log(help.script);
  }
}
