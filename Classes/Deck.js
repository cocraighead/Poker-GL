import * as Card from './Card.js'

export class Deck  {
    constructor(suites,cardNumbersStart,cardNumbersEnd) {
        this.cards = [];

        suites.forEach(suite => {
            for(var cardNumber=Number(cardNumbersStart);cardNumber<=Number(cardNumbersEnd);cardNumber++)
            this.cards.push(
                new Card(suite, cardNumber)
            )
        });
    }


}