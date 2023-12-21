import {Deck} from './Classes/Deck.js'
import {Player} from './Classes/Player.js'
import {Card} from './Classes/Card.js'

export function pokerlogic(){
    // Game Engine
    var gameVar = {
        suites: ['c'],
        cardNumbersStart: '2',
        cardNumbersEnd: '14',
        numberOfPlayers: 2,
        playingAs: 2,

        gameState: 0, // 0=game started , 1=rest , 2=flop, 3=turn, 4=river
        gameStateFuse: false,
        
        setUpGame: function(){
            this.deck = new Deck(this.suites,this.cardNumbersStart,this.cardNumbersEnd)
            this.deck.shuffle(1)
            this.players = []
            for(var i=0;i<this.numberOfPlayers;i++){
                this.players.push(
                    new Player(i)
                )
            }
            this.board = []

            this.gameState = 1
        },

        deal: function(){
            for(var i=0;i<this.players.length;i++){
                this.players[i].hand.push(this.deck.cards.pop())
            }
            for(var i=0;i<this.players.length;i++){
                this.players[i].hand.push(this.deck.cards.pop())
            }
            this.gameState = 1
        },

        burnAndTurn: function(burn,turn){
            for(var i=0;i<burn;i++){
                this.deck.cards.pop()
            }
            for(var i=0;i<turn;i++){
                this.board.push(this.deck.cards.pop())
            }
            this.gameState = 1
        },

        run: function(stepClicks){
            if(stepClicks === 1){
                this.deal()
            }else if(stepClicks === 2){
                this.burnAndTurn(1,3)
            }else if(stepClicks === 4){
                this.burnAndTurn(1,1)
            }else if(stepClicks === 6){
                this.burnAndTurn(1,1)
            }else if(stepClicks === -1){
                this.setUpGame()
                this.gameState = 0
            }

        }


    }
    
    /// UI
    var uiVar = {stepClicks:0,stepFuse:false,checkFlopToggle:false,peekCardsToggle:false}

    document.addEventListener('DOMContentLoaded', function(event){
        _mainPokerLogic();
    });

    function _mainPokerLogic(){
        uiSetup()
    };

    function dealClicked(){
        uiVar.stepClicks = 1
        uiVar.stepFuse = true
    }

    function flopClicked(){
        uiVar.stepClicks = 2
        uiVar.stepFuse = true
    }

    function turnClicked(){
        uiVar.stepClicks = 4
        uiVar.stepFuse = true
    }

    function riverClicked(){
        uiVar.stepClicks = 6
        uiVar.stepFuse = true
    }

    function resetClicked(){
        uiVar.stepClicks = -1
        uiVar.checkFlopToggle = false
        uiVar.peekCardsToggle = false
        uiVar.stepFuse = true
    }

    function checkFlopClicked(){
        uiVar.checkFlopToggle = !uiVar.checkFlopToggle
        uiVar.peekCardsToggle = false
    }

    function peekCardsClicked(){
        uiVar.peekCardsToggle = !uiVar.peekCardsToggle
        uiVar.checkFlopToggle = false
    }

    function uiSetup(){
        uiVar['deal-button'] = document.getElementById('deal-button');
        uiVar['deal-button'].addEventListener('click',dealClicked)

        uiVar['flop-button'] = document.getElementById('flop-button');
        uiVar['flop-button'].addEventListener('click',flopClicked)

        uiVar['turn-button'] = document.getElementById('turn-button');
        uiVar['turn-button'].addEventListener('click',turnClicked)
        
        uiVar['river-button'] = document.getElementById('river-button');
        uiVar['river-button'].addEventListener('click',riverClicked)

        uiVar['reset-button'] = document.getElementById('reset-button');
        uiVar['reset-button'].addEventListener('click',resetClicked)

        uiVar['check-flop-button'] = document.getElementById('check-flop-button');
        uiVar['check-flop-button'].addEventListener('click',checkFlopClicked)

        uiVar['peek-cards-button'] = document.getElementById('peek-cards-button');
        uiVar['peek-cards-button'].addEventListener('click',peekCardsClicked)
    }

    return {uiVar,gameVar}
}