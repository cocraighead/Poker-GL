export class Card  {
    constructor(suite, number) {
        this.suite = suite; // char
        this.number = number; // number 1-14
    }
    // override when converting instance to string
    toString() {
        return this.suite+this.number
    }
    // uses icons instead of char
    toHtmlString(){
        var suiteHtml = ''
        if(this.suite === 'c'){
            suiteHtml = '<span class="i-span-club"></span>'
        }else if(this.suite === 'd'){
            suiteHtml = '<span class="i-span-diamond"></span>'
        }else if(this.suite === 'h'){
            suiteHtml = '<span class="i-span-heart"></span>'
        }else if(this.suite === 's'){
            suiteHtml = '<span class="i-span-spade"></span>'
        }
        return suiteHtml+this.number
    }
    static compare(a,b) {
        return a.number - b.number
    }
  }