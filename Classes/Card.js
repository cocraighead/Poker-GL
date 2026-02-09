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
        var numberClass = ''
        if(this.suite === 'c'){
            suiteHtml = '<span class="i-span-club"></span>'
            numberClass = 'card-number-black'
        }else if(this.suite === 'd'){
            suiteHtml = '<span class="i-span-diamond"></span>'
            numberClass = 'card-number-red'
        }else if(this.suite === 'h'){
            suiteHtml = '<span class="i-span-heart"></span>'
            numberClass = 'card-number-red'
        }else if(this.suite === 's'){
            suiteHtml = '<span class="i-span-spade"></span>'
            numberClass = 'card-number-black'
        }
        let numberOveride = this.number
        if(this.number == 11){
            numberOveride = 'J'
        }else if(this.number == 12){
            numberOveride = 'Q'
        }else if(this.number == 13){
            numberOveride = 'K'
        }else if(this.number == 14){
            numberOveride = 'A'
        }
        return suiteHtml + '<span class="' + numberClass + '">' + numberOveride + '</span>'
    }
    static compare(a,b) {
        return a.number - b.number
    }
  }