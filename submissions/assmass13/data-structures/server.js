const http = require('http');

const StackRouter = require('./routers/stack-router');
const LinkedListRouter = require('./routers/linked-list-router');

const routes = {
  ...new StackRouter().routes,
  ...new LinkedListRouter().routes
};

const noRouteFound = (req, res) => {
  res.statusCode = 404;
  res.end('Requested resource not found.');
};

const server = http.createServer((req, res) => {
  const route = `${req.method} ${req.url}`;
  const handler = routes[route] || noRouteFound;
  handler(req, res);
});

server.listen(3000);
