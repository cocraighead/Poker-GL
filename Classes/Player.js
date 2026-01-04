import {Card} from './Card.js'

export class Player  {
    constructor(id,name) {
        this.hand = []; // card[]

        this.id = id
        this.name = name || 'P#'+id
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
    /**
     * hand to string for html - uses icons instead of chars
     * @returns 
     */
    handToHtmlString(){
        var handStr = ''
        if(this.hand.length){
            handStr += this.hand[0].toHtmlString() + ',' + this.hand[1].toHtmlString()
        }
        return '<p>' + handStr + '</p>'
    }
}