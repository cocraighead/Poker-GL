import {Card} from './Card.js'

export class Deck  {
    constructor(suites,cardNumbersStart,cardNumbersEnd) {
        this.cards = []; // cards[]
        // creates a card of each suite and numbber
        suites.forEach(suite => {
            for(var cardNumber=Number(cardNumbersStart);cardNumber<=Number(cardNumbersEnd);cardNumber++)
            this.cards.push(
                new Card(suite, cardNumber)
            )
        });
    }
    /**
     * removes the top card
     * @returns top card
     */
    pop(){
        return this.cards.shift();
    }
    /**
     * removes card at index
     * @param {*} index - index in deck
     * @returns card removed
     */
    remove(index){
        return this.cards.splice(index, 1)[0];
    }
    /**
     * randomly re-orders the deck
     * @param {*} shuffles - times to shuffle
     */
    shuffle(shuffles){
        for(var i=0;i<shuffles;i++){
            var bag = []
            var numCards = this.cards.length
            for(var j=0;j<numCards;j++){
                var randIndex = Math.floor(Math.random() * this.cards.length);
                bag.push(this.remove(randIndex))
            }
            this.cards = bag
        }
    }


}