import {Deck} from './Classes/Deck.js'
import {Player} from './Classes/Player.js'
import {Card} from './Classes/Card.js'

export function pokerlogic(){
    // Game Engine
    var gameVar = {
        suites: ['c','s','h','d'],
        cardNumbersStart: '2',
        cardNumbersEnd: '14',
        numberOfPlayers: 5,
        smallBlind: 1,
        bigBlind: 3,
        
        setUpGame: function(){
            this.players = []
            for(var i=0;i<this.numberOfPlayers;i++){
                this.players.push(
                    new Player(i)
                )
            }
            this.board = []
            this.setUpRound()
        },

        setUpRound: function(){
            // ui
            uiVar.stepClicks = -1
            uiVar.checkFlopToggle = false
            uiVar.peekCardsToggle = false
            uiVar.stepFuse = true
            // game 
            this.deck = new Deck(this.suites,this.cardNumbersStart,this.cardNumbersEnd)
            this.deck.shuffle(1)
            this.dealerIndex = this.dealerIndex ? (this.dealerIndex+1)%this.numberOfPlayers : 0
            this.pot = 0
            for(var i=0;i<this.numberOfPlayers;i++){
                this.players[i].hand = []
                this.players[i].isIn = true
                this.players[i].totalInPot = 0
            }
            // blinds
            if(this.numberOfPlayers === 2){
                this.bet(this.bigBlind,(this.dealerIndex+1)%this.numberOfPlayers)
                this.currentPlayerIndex = this.dealerIndex
            }else{
                this.bet(this.smallBlind,(this.dealerIndex+1)%this.numberOfPlayers)
                this.bet(this.bigBlind,(this.dealerIndex+2)%this.numberOfPlayers)
                this.currentPlayerIndex = (this.dealerIndex+3)%this.numberOfPlayers
            }
            this.setUpStreet()
        },

        setUpStreet: function(){
            for(var i=0;i<this.numberOfPlayers;i++){
                this.players[i].firstTurnOnStreet = true
            }
        },

        deal: function(){
            for(var i=0;i<this.players.length;i++){
                this.players[i].hand.push(this.deck.cards.pop())
            }
            for(var i=0;i<this.players.length;i++){
                this.players[i].hand.push(this.deck.cards.pop())
            }
        },

        burnAndTurn: function(burn,turn){
            for(var i=0;i<burn;i++){
                this.deck.cards.pop()
            }
            for(var i=0;i<turn;i++){
                this.board.push(this.deck.cards.pop())
            }
        },

        nextAction: function(){
            var numPlayersIn = 0
            for(var i=0;i<this.numberOfPlayers;i++){
                if(this.players[i].isIn){
                    numPlayersIn += 1
                }
            }
            if(numPlayersIn===1){
                return {index:this.currentPlayerIndex,newStreet:false,newRound:true}
            }
            // next action
            for(var i=0;i<this.numberOfPlayers-1;i++){
                var iPlayer = (this.currentPlayerIndex+i+1)%this.numberOfPlayers
                if(
                    this.players[iPlayer].isIn && (
                        this.players[iPlayer].totalInPot < this.maxTotalInPot(iPlayer) ||
                        this.players[iPlayer].firstTurnOnStreet
                    )
                ){
                    this.players[this.currentPlayerIndex].firstTurnOnStreet = false
                    return {index:iPlayer,newStreet:false,newRound:false}
                }
            }
            // next action new round
            for(var i=0;i<this.numberOfPlayers;i++){
                var iPlayer = (this.dealerIndex+i+1)%this.numberOfPlayers
                if(this.players[iPlayer].isIn){
                    return {index:iPlayer,newStreet:true,newRound:false}
                }
            }
        },

        nextStreet: function(){
            this.setUpStreet()
            // trigger animation
            if(uiVar.stepClicks == 1){ 
                uiVar.stepClicks = 2 // flop
                uiVar.stepFuse = true
            }else if(uiVar.stepClicks == 2){ 
                uiVar.stepClicks = 4 // turn
                uiVar.stepFuse = true
            }else if(uiVar.stepClicks == 4){ 
                uiVar.stepClicks = 6 // river
                uiVar.stepFuse = true
            }
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
            }
        },

        bet: function(amount,playerIndex){
            this.players[playerIndex].total -= amount
            this.players[playerIndex].totalInPot += amount
        },

        call: function(playerIndex){
            var maxTotalInPot = this.maxTotalInPot(playerIndex)
            var amount = maxTotalInPot - this.players[playerIndex].totalInPot
            this.bet(amount,playerIndex)
        },

        maxTotalInPot: function(playerIndex){
            var maxTotalInPot = 0
            for(var i=0;i<this.players.length;i++){
                if(playerIndex !== i){
                    if(this.players[i].totalInPot > maxTotalInPot){
                        maxTotalInPot = this.players[i].totalInPot
                    }
                }
            }
            return maxTotalInPot
        }

    }
    
    /// UI
    var uiVar = {stepClicks:0,stepFuse:false,checkFlopToggle:false,peekCardsToggle:false}

    document.addEventListener('DOMContentLoaded', function(event){
        _mainPokerLogic();
    });

    function _mainPokerLogic(){
        setupUIEvents()
        renderUI()
    };

    function dealClicked(){
        uiVar.stepClicks = 1
        uiVar.stepFuse = true
        renderUI()
    }

    function resetClicked(){
        gameVar.setUpRound()
        renderUI()
    }

    function checkFlopClicked(){
        uiVar.checkFlopToggle = !uiVar.checkFlopToggle
        uiVar.peekCardsToggle = false
    }

    function peekCardsClicked(){
        uiVar.peekCardsToggle = !uiVar.peekCardsToggle
        uiVar.checkFlopToggle = false
    }

    function foldClicked(){
        gameVar.players[gameVar.currentPlayerIndex].isIn = false
        var nextActionData = gameVar.nextAction()
        gameVar.currentPlayerIndex = nextActionData.index
        if(nextActionData.newStreet){
            gameVar.nextStreet()
        }
        if(nextActionData.newRound){
            gameVar.setUpRound()
        }
        renderUI()
    }

    function checkClicked(){
        var nextActionData = gameVar.nextAction()
        gameVar.currentPlayerIndex = nextActionData.index
        if(nextActionData.newStreet){
            gameVar.nextStreet()
        }
        if(nextActionData.newRound){
            gameVar.setUpRound()
        }
        renderUI()
    }

    function callClicked(){
        gameVar.call(gameVar.currentPlayerIndex)
        var nextActionData = gameVar.nextAction()
        gameVar.currentPlayerIndex = nextActionData.index
        if(nextActionData.newStreet){
            gameVar.nextStreet()
        }
        if(nextActionData.newRound){
            gameVar.setUpRound()
        }
        renderUI()
    }

    function raiseClicked(){
        var raiseInputValue = document.getElementById('raise-input').value
        raiseInputValue = Number(raiseInputValue)
        if(!raiseInputValue || isNaN(raiseInputValue)){
            return
        }
        gameVar.bet(raiseInputValue,gameVar.currentPlayerIndex)
        var nextActionData = gameVar.nextAction()
        gameVar.currentPlayerIndex = nextActionData.index
        if(nextActionData.newStreet){
            gameVar.nextStreet()
        }
        renderUI()
    }

    function setupUIEvents(){
        uiVar['deal-button'] = document.getElementById('deal-button');
        uiVar['deal-button'].addEventListener('click',dealClicked)

        uiVar['reset-button'] = document.getElementById('reset-button');
        uiVar['reset-button'].addEventListener('click',resetClicked)

        uiVar['check-flop-button'] = document.getElementById('check-flop-button');
        uiVar['check-flop-button'].addEventListener('click',checkFlopClicked)

        uiVar['peek-cards-button'] = document.getElementById('peek-cards-button');
        uiVar['peek-cards-button'].addEventListener('click',peekCardsClicked)

        uiVar['check-button'] = document.getElementById('check-button');
        uiVar['check-button'].addEventListener('click',checkClicked)
        
        uiVar['fold-button'] = document.getElementById('fold-button');
        uiVar['fold-button'].addEventListener('click',foldClicked)

        uiVar['call-button'] = document.getElementById('call-button');
        uiVar['call-button'].addEventListener('click',callClicked)

        uiVar['raise-button'] = document.getElementById('raise-button');
        uiVar['raise-button'].addEventListener('click',raiseClicked)
    }

    function uiTableUpdate(){
        var table = document.createElement('table')
        var theader = table.createTHead()
        var theaderRow = theader.insertRow()
        var tbody = table.createTBody()
        var properties = ['position','isIn','total','totalInPot']
        for(var j=0;j<properties.length;j++){
            var hr = theaderRow.insertCell()
            hr.innerHTML = properties[j]
        }
        for(var i=0;i<gameVar.players.length;i++){
            var tr = tbody.insertRow()
            if(i===gameVar.currentPlayerIndex){
                tr.classList.add('table-row-current-player') 
            }
            for(var j=0;j<properties.length;j++){
                var td = tr.insertCell()
                td.innerHTML = gameVar.players[i][properties[j]]
            }
        }
        $("#data-table").html(table)
    }

    function renderUI(){
        uiVar['deal-button'].disabled = uiVar.stepClicks >= 1

        uiVar['reset-button'].disabled = false

        uiVar['check-flop-button'].disabled = uiVar.stepClicks < 2

        uiVar['peek-cards-button'].disabled = uiVar.stepClicks < 1

        uiVar['check-button'].disabled = uiVar.stepClicks < 1 ||
            gameVar.players[gameVar.currentPlayerIndex].totalInPot < gameVar.maxTotalInPot(gameVar.currentPlayerIndex)
        
        uiVar['fold-button'].disabled = uiVar.stepClicks < 1

        uiVar['call-button'].disabled = uiVar.stepClicks < 1 ||
            gameVar.players[gameVar.currentPlayerIndex].totalInPot >= gameVar.maxTotalInPot(gameVar.currentPlayerIndex)

        uiVar['raise-button'].disabled = uiVar.stepClicks < 1

        uiTableUpdate()
    }

    return {uiVar,gameVar}
}