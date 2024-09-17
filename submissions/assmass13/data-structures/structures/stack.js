const LinkedList = require('./linked-list');

module.exports = class Stack {
  constructor() {
    this.linkedList = new LinkedList();
  }

  push(value) {
    return this.linkedList.unshift(value);
  }

  pop() {
    return this.linkedList.shift();
  }

  showStack() {
    return this.linkedList.showList().reverse();
  }
};
