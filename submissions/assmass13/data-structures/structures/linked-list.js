const Node = require('./node');

module.exports = class LinkedList {
  constructor() {
    this.head = null;
    this.tail = null;
    this.length = 0;
  }

  pop() {
    if (!this.head) return null;
    let currentNode = this.head;
    let newTail = currentNode;
    while (currentNode.next) {
      newTail = currentNode;
      currentNode = currentNode.next;
    }
    this.tail = newTail;
    this.tail.next = null;
    this.length -= 1;
    if (this.length === 0) {
      this.head = null;
      this.tail = null;
    }
    return currentNode;
  }

  shift() {
    if (!this.head) return null;
    const oldHead = this.head;
    this.head = oldHead.next;
    this.length -= 1;
    if (this.length === 0) {
      this.tail = null;
    }
    return oldHead;
  }

  unshift(value) {
    const newNode = new Node(value);
    if (!this.head) {
      this.head = newNode;
      this.tail = newNode;
    } else {
      newNode.next = this.head;
      this.head = newNode;
    }
    this.length += 1;
    return this;
  }

  insertBeforeSuccessors(value, successor) {
    let previousNode = null;
    let currentNode = this.head;

    while (currentNode) {
      if (currentNode.value === successor) {
        const newNode = new Node(value);
        if (previousNode) previousNode.next = newNode;
        else this.head = newNode;
        newNode.next = currentNode;
      }

      previousNode = currentNode;
      currentNode = currentNode.next;
    }
  }

  removeValue(removeValue) {
    let previousNode = null;
    let currentNode = this.head;

    while (currentNode) {
      if (currentNode.value === removeValue) {
        if (previousNode) {
          currentNode = currentNode.next;
          previousNode.next = currentNode;
        } else {
          this.head = currentNode.next;
          currentNode = this.head;
        }
      }

      while (currentNode && currentNode.value !== removeValue) {
        previousNode = currentNode;
        currentNode = currentNode.next;
      }
    }
  }

  showList() {
    const values = [];
    let currentNode = this.head;
    while (currentNode) {
      values.push(currentNode.value);
      currentNode = currentNode.next;
    }
    return values;
  }
};
