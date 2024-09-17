class Node {
  constructor (value, prevNode, nextNode) {
    this._value = value;
    this._prevNode = prevNode;
    this._nextNode = nextNode;
  }

  getValue () {
    return this._value;
  }

  getPrev () {
    return this._prevNode;
  }

  getNext () {
    return this._nextNode;
  }

  setNext (value) {
    this._nextNode = value ? new Node(value, null, this._nextNode) : null;
  }
}

module.exports = Node;
