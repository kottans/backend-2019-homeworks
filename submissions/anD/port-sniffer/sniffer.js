const net = require('net');
const dns = require('dns').promises;

function help () {
  return ` Sniffer is CLI tool which allows user to search for opened TCP ports on host 
          Synopsis:
              node sniffer.js [options] [value]
              
           Examples:
              node sniffer.js --ports 10-9999 --host google.com
              node sniffer.js --host google.com --ports 172.213.3.110
              node sniffer.js --host google.com --ports 10 --timeout 3000
          
           Options:
              --ports            sets value from port range 1-65535 
              --host             sets hostname or IP address(172.213.3.110, google.com)
              --timeout          sets timeout milliseconds of inactivity on the socket.By default 300 ms 
              --help            print usage message on console
          `;
}

function getArguments (...requiredFlags) {
  const args = process.argv.slice(2);

  return args.reduce((args, argvFlag, argvIndex, argvArray) => {
    this.arguments = args;

    requiredFlags.forEach(flag => {
      if (
        argvFlag === flag &&
        argvIndex % 2 === 0 &&
        argvArray.length % 2 === 0
      ) {
        this.arguments[argvFlag.replace('--', '')] = argvArray[argvIndex + 1];
      } else if (argvArray.length === 1 && argvFlag === flag) {
        this.arguments[argvFlag.replace('--', '')] = true;
      }
    });

    if (Object.keys(this.arguments).length === 0) {
      process.stdout.write(`The required arguments are: ${requiredFlags}\n`);
      process.exit(1);
    }
    return this.arguments;
  }, {});
}

function getPort (ports) {
  const defaultRange = '1-65535';
  if (!ports) {
    ports = defaultRange;
  }
  return ports
    .toString()
    .split('-')
    .map((item, index, arr) => {
      if (isNaN(Number(item)) || arr[index] >= arr[index + 1]) {
        process.stdout.write(
          "--ports value isn't a number or have incorrect format\n"
        );
        process.exit(1);
      }
      return Number(item);
    });
}

function connect (port, host, timeout) {
  return new Promise((resolve, reject) => {
    const socket = new net.Socket();

    socket.setTimeout(Number(timeout) || 300);

    socket.on('connect', () => {
      process.stdout.write('.');
      resolve(port);
      socket.destroy();
    });

    socket.on('timeout', () => {
      const err = new Error(`timeout: ${port} `);
      reject(err.message);
      socket.destroy();
    });

    socket.on('lookup', err => {
      if (err) {
        socket.destroy();
        reject(err);
      }
    });

    socket.on('error', err => {
      reject(err);
      socket.destroy();
    });

    socket.connect(port, host);
  });
}

function handleError (e) {
  if (e.code === 'ENOENT' || e.code === 'ENOTFOUND') {
    throw e.message;
  } else if (e.code === 'ERR_SOCKET_BAD_PORT') {
    const err = 'Port should be >= 0 and < 65536';
    throw (err.message);
  }

  return e;
}

function getHostIp (host) {
  return dns
    .lookup(host)
    .then(ip => ip.address)
    .catch(e => handleError(e));
}

async function getConnectionResponse (host, [start, end], timeout) {
  this.end = end || start;
  const response = [];
  const ip = await getHostIp(host);

  for (let port = start; port <= this.end; port += 1) {
    response.push(connect(port, ip, timeout).catch(e => handleError(e)));
  }

  const promise = await Promise.all(response);
  return promise;
}

(function scan () {
  const args = getArguments('--ports', '--host', '--timeout', '--help');

  const range = getPort(args.ports);

  if (args.help) {
    process.stdout.write(`${help()}\n`);
    process.exit(0);
  }

  getConnectionResponse(args.host, range, args.timeout).then(
    resolved => {
      const openPorts = resolved.filter(Number);
      openPorts.length > 0
        ? process.stdout.write(`\n${openPorts} ports are opened\n`)
        : process.stdout.write('no opened ports\n');
    },

    rejected => {
      process.stdout.write(`${rejected}\n`);
      process.exit(1);
    }
  );
})();
