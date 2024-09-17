const Node = require('./node');

class Stack {
  constructor () {
    this._top = null;
    this._size = 0;
  }

  top () {
    if (this._top) {
      return this._top.getValue();
    }
    return 'Empty stack';
  }

  size () {
    return this._size.toString();
  }

  push (value) {
    this._top = new Node(value, this._top);
    this._size += 1;
  }

  pop () {
    let currTop;
    if (this._size) {
      [this._top, currTop] = [this._top.getPrev(), this._top];
      this._size -= 1;
      return currTop.getValue();
    }
    return 'No elements in stack';
  }
}

module.exports = Stack;
