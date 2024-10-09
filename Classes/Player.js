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


}