const http = require('http');
const Stack = require('./stack');
const List = require('./list');
const port = 3000;
const stackInst = new Stack();
const listInst = new List();
const requestHandler = (req, resp) => {
  const url = req.url.slice(1).split('/');
  if (url[0] === '') {
    resp.end('Choose stack or list in URL');
  }
  if (url[0] === 'stack') {
    if (req.method === 'GET') {
      if (url[1] === 'top') {
        resp.end(stackInst.top());
      }
      if (url[1] === 'size') {
        resp.end(stackInst.size());
      }
      if (url[1] === 'pop') {
        resp.end(stackInst.pop());
      }
    }
    if (req.method === 'POST') {
      req.on('data', (data) => stackInst.push(data.toString()));
      resp.end();
    }
  }
  if (url[0] === 'list') {
    if (req.method === 'POST') {
      req.on('data', data => {
        const { successor, value } = JSON.parse(data.toString());
        listInst.insert(successor, value);
      });
      resp.end();
    }
    if (req.method === 'GET') {
      resp.end(listInst.show());
    }
    if (req.method === 'DELETE') {
      listInst.remove(url[1], 'head');
      resp.end();
    }
  }
};
const server = http.createServer(requestHandler);

server.listen(port, (err) => {
  if (err) {
    return console.log('something bad happened', err);
  }
  console.log(`server is listening on ${port}`);
});
