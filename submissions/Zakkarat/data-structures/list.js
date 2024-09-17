const Node = require('./node');

class List {
  constructor () {
    this._head = null;
    this._size = 0;
  }

  insert (searchNode, value) {
    let currNode = this._head;
    if (this._head) {
      if (this._head.getValue() === searchNode) {
        this._head = new Node(value, null, this._head);
        this._size += 1;
        return;
      }
      currNode = this.getTo(this._head, searchNode);
      currNode.setNext(value);
    } else {
      this._head = new Node(value, null, null);
    }
    this._size += 1;
  }

  getTo (node, value) {
    if (!node.getNext() || !node.getNext().getValue() || node.getNext().getValue() === value) {
      return node;
    }
    return this.getTo(node.getNext(), value);
  }

  show () {
    let tempNode = this._head;
    return [...Array(this._size).keys()].map(_ => {
      const value = tempNode.getValue();
      tempNode = tempNode.getNext();
      return value;
    }).join('->');
  }

  remove (value, node) {
    if (node === 'head') {
      node = this._head;
      if (node.getValue() === value) {
        this._head = node.getNext();
        this._size -= 1;
        return;
      }
    }
    if (!node.getNext()) {
      return;
    }
    if (node.getNext().getValue() === value) {
      if (!node.getNext().getNext()) {
        node.setNext(null);
        this._size -= 1;
        return;
      }
      node.setNext(node.getNext().getNext().getValue());
      this._size -= 1;
      return;
    }
    return this.remove(value, node.getNext());
  }
}

module.exports = List;
