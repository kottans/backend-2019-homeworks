const LinkedList = require('../structures/linked-list');
const parsedBodyValues = require('../request-handler');

class LinkedListRouter {
  constructor() {
    this.linkedList = new LinkedList();
    this.routes = {
      'GET /linked-list': this.getLinkedListRoute.bind(this),
      'PATCH /linked-list': this.patchLinkedListRoute.bind(this)
    };
  }

  getLinkedListRoute(req, res) {
    res.statusCode = 200;
    res.end(this.linkedList.showList().toString());
  }

  patchLinkedListRoute(req, res) {
    return parsedBodyValues(req, res)
      .then(({ add, successor, remove }) => {
        if (add && successor) {
          this.linkedList.insertBeforeSuccessors(add, successor);
        } else if (add) {
          this.linkedList.unshift(add);
        } else if (remove) {
          this.linkedList.removeValue(remove);
        }
        res.statusCode = 200;
        res.end(this.linkedList.showList().toString());
      })
      .catch(error => {
        res.statusCode = 400;
        res.end(error.toString());
      });
  }
}

module.exports = LinkedListRouter;
