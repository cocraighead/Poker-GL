export class Card  {
    constructor(suite, number) {
        this.suite = suite; // char
        this.number = number; // number 1-14
    }
    // override when converting instance to string
    toString() {
        return this.suite+this.number
    }
    static compare(a,b) {
        return a.number - b.number
    }
  }