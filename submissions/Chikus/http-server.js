const http = require('http');
const dataStore = require('./data-store.js');

const stack = new dataStore.Stack();
const linkl = new dataStore.LinkedList();

http
  .createServer(function reqres(req, res) {
    if (req.url === '/api/linkedlist') {
      let elem = '';
      if (req.method === 'POST') {
        req.on('data', chunk => {
          elem = chunk.toString().split(' ');
          if (elem.length > 2) {
            linkl.insertAt(elem[1], elem[3]);
          } else linkl.insert(elem[1]);
        });
        res.end();
      }
      if (req.method === 'GET') {
        res.end(`${linkl.printList()}`);
      }
      if (req.method === 'DELETE') {
        req.on('data', chunk => {
          linkl.removeElement(chunk.toString());
        });
        res.end();
      }
    }
    if (req.url === '/api/stack') {
      if (req.method === 'POST') {
        req.on('data', chunk => {
          stack.push(parseInt(chunk.toString(), 10));
        });
        res.end();
      }
      if (req.method === 'DELETE') {
        res.end(`${stack.pop()}`);
      }
    }
  })
  .listen(3000);
