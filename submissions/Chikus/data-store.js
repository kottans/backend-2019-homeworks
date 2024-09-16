/* eslint max-classes-per-file: ["error", 3] */
exports.Stack = class Stack {
  constructor() {
    this.items = [];
  }

  pop() {
    if (this.items.length === 0) {
      return `'Underflow'`;
    }
    return this.items.pop();
  }

  push(element) {
    this.items.push(element);
  }
};

class Node {
  constructor(element) {
    this.element = element;
    this.next = null;
  }
}

exports.LinkedList = class LinkedList {
  constructor() {
    this.head = null;
    this.size = 0;
  }

  insert(element) {
    const node = new Node(element);
    let current;
    if (this.head == null) {
      this.head = node;
    } else {
      current = this.head;
      while (current.next) {
        current = current.next;
      }
      current.next = node;
    }
    this.size += 1;
  }

  insertAt(element, locationElement) {
    const node = new Node(element);
    let curr;
    let prev;
    curr = this.head;
    let it = 1;
    while (locationElement !== curr.element) {
      it += 1;
      prev = curr;
      curr = curr.next;
      if (it > this.size) {
        return -1;
      }
    }
    node.next = curr;
    if (prev) prev.next = node;
    else this.head = node;
    this.size += 1;
    return 0;
  }

  removeElement(element) {
    let current = this.head;
    let prev = null;
    while (current != null) {
      if (current.element === element) {
        if (prev == null) {
          this.head = current.next;
        } else {
          prev.next = current.next;
        }
        this.size -= 1;
        return current.element;
      }
      prev = current;
      current = current.next;
    }
    return -1;
  }

  printList() {
    let curr = this.head;
    let str = '';
    while (curr) {
      str += `${curr.element} `;
      curr = curr.next;
    }
    return str;
  }
};
