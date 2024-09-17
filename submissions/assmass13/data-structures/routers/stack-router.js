const Stack = require('../structures/stack');
const parsedBodyValues = require('../request-handler');

class StackRouter {
  constructor() {
    this.stack = new Stack();
    this.routes = {
      'POST /stack': this.postStackRoute.bind(this),
      'DELETE /stack': this.deleteStackRoute.bind(this)
    };
  }

  async postStackRoute(req, res) {
    return parsedBodyValues(req)
      .then(({ add }) => {
        this.stack.push(add);
        res.statusCode = 201;
        res.end(this.stack.showStack().toString());
      })
      .catch(error => {
        res.statusCode = 400;
        res.end(error.toString());
      });
  }

  deleteStackRoute(req, res) {
    const removedNode = this.stack.pop();
    if (removedNode) {
      res.statusCode = 200;
      res.end(removedNode.value.toString());
    } else {
      res.statusCode = 404;
      res.end('Stack is empty.');
    }
  }
}

module.exports = StackRouter;
