export class Card  {
    constructor(suite, number) {
        this.suite = suite;
        this.number = number;
    }
    toString() {
        return this.suite+this.number;
      }
  }