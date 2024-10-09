import {Card} from './Card.js'

export class Player  {
    constructor(position) {
        this.hand = [];

        this.position = position
        this.isIn = true
        this.total = 100
        this.totalInPot = 0
        this.firstTurnOnStreet = true
    }
    handToString(){
        var handStr = ''
        if(this.hand.length){
            handStr += this.hand[0] + ',' + this.hand[1]
        }
        return handStr
    }

}