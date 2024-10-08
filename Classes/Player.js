import {Card} from './Card.js'

export class Player  {
    constructor(position) {
        this.hand = []; // card[]

        this.position = position
        this.isIn = true // is in this round
        this.total = 100 // $ total
        this.totalInPot = 0 // $ total in pot
        this.firstTurnOnStreet = true // still hasn't had a turn to bet on this street
    }
    /**
     * hand as a string
     * @returns hand as a string
     */
    handToString(){
        var handStr = ''
        if(this.hand.length){
            handStr += this.hand[0] + ',' + this.hand[1]
        }
        return handStr
    }
}