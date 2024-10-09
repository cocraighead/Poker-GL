import {Deck} from './Classes/Deck.js'
import {Player} from './Classes/Player.js'
import {Card} from './Classes/Card.js'

export function pokerlogic(){
    // Game Object
    var gameVar = {
        // game params
        suites: ['c','s','h','d'],
        cardNumbersStart: '2',
        cardNumbersEnd: '14',
        numberOfPlayers: 5,
        smallBlind: 1,
        bigBlind: 3,
        
        /**
         * sets up a new games values
         */
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
        /**
         * re-sets values for a new round
         */
        setUpRound: function(){
            // ui / animation
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
            // blinds and first action
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
        /**
         * re-sets values for a new street
         */
        setUpStreet: function(){
            // indicate players haven't had a chance to bet this street
            for(var i=0;i<this.numberOfPlayers;i++){
                this.players[i].firstTurnOnStreet = true
            }
        },
        /**
         * gives each player 2 cards from deck
         * this follows the correct deal order
         */
        deal: function(){
            for(var n=0;n<2;n++){ // deal 2 cards
                for(var i=0;i<this.players.length;i++){
                    var iPlayer = (this.currentPlayerIndex+i)%this.players.length
                    this.players[iPlayer].hand.push(this.deck.cards.pop())
                }
            }
        },
        /**
         * used to flop, turn, and river the cards
         * @param {*} burn # of cards to burn
         * @param {*} turn # of cards to turn
         */
        burnAndTurn: function(burn,turn){
            for(var i=0;i<burn;i++){
                this.deck.cards.pop()
            }
            for(var i=0;i<turn;i++){
                this.board.push(this.deck.cards.pop())
            }
        },
        /**
         * determines who has the next action
         * can be a new street or round
         * @returns {index,newStreet,newRound} - index of next player,bool,bool
         */
        nextAction: function(){
            // 1 player in = new round
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
            // next action new street
            for(var i=0;i<this.numberOfPlayers;i++){
                var iPlayer = (this.dealerIndex+i+1)%this.numberOfPlayers
                if(this.players[iPlayer].isIn){
                    return {index:iPlayer,newStreet:true,newRound:false}
                }
            }
        },
        /**
         * sets up a new street and triggers animation
         */
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
        /**
         * runs the action
         * this is triggered by webGL before animation starts
         * @param {*} stepClicks 
         */
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
            renderUI()
        },
        /**
         * bets an amount for a player
         * @param {*} amount - $
         * @param {*} playerIndex - player to bet 
         */
        bet: function(amount,playerIndex){
            this.players[playerIndex].total -= amount
            this.players[playerIndex].totalInPot += amount
        },
        /**
         * player calls the pot using bet
         * @param {*} playerIndex - player to bet 
         */
        call: function(playerIndex){
            var maxTotalInPot = this.maxTotalInPot(playerIndex)
            var amount = maxTotalInPot - this.players[playerIndex].totalInPot
            this.bet(amount,playerIndex)
        },
        /**
         * helper function to indicate how much a player owes to call
         * @param {*} playerIndex - player to call
         * @returns $
         */
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
    
    /// UI object used by webGL to trigger animations
    var uiVar = {
        stepClicks:0, // state of round -> 0=rest , 1=deal , 2=flopping, 3=fflop, 4=turning, 5=fturn, 6=rivering, 7=friver
        stepFuse:false, // flags to webGL an new state
        checkFlopToggle:false, // flags to webGL to change camera
        peekCardsToggle:false // flags to webGL to change camera
    }

    document.addEventListener('DOMContentLoaded', function(event){
        _mainPokerLogic();
    });
    /**
     * runs when document is ready - setup ui
     */
    function _mainPokerLogic(){
        setupUIEvents()
        renderUI()
    };
    /**
     * event when deal btn is clicked
     */
    function dealClicked(){
        uiVar.stepClicks = 1
        uiVar.stepFuse = true
        renderUI()
    }
    /**
     * event when check flop btn is clicked
     */
    function checkFlopClicked(){
        uiVar.checkFlopToggle = !uiVar.checkFlopToggle
        uiVar.peekCardsToggle = false
    }
    /**
     * event when peek btn is clicked
     */
    function peekCardsClicked(){
        uiVar.peekCardsToggle = !uiVar.peekCardsToggle
        uiVar.checkFlopToggle = false
    }
    /**
     * event when fold btn is clicked
     */
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
    /**
     * event when check btn is clicked
     */
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
    /**
     * event when call btn is clicked
     */
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
    /**
     * event when raise btn is clicked
     */
    function raiseClicked(){
        var raiseInputValue = document.getElementById('raise-input').value
        raiseInputValue = Number(raiseInputValue)
        // invalid raise
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
    /**
     * connects ui elements to their event functions
     */
    function setupUIEvents(){
        uiVar['deal-button'] = document.getElementById('deal-button');
        uiVar['deal-button'].addEventListener('click',dealClicked)

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
    /**
     * re-renders player table
     */
    function uiTableUpdate(){
        var table = document.createElement('table')
        var theader = table.createTHead()
        var theaderRow = theader.insertRow()
        var tbody = table.createTBody()
        // headers
        var properties = [
            {id:'position',label:'P#'},
            {id:'total',label:'$stack'},
            {id:'totalInPot',label:'$inPot'}
        ]
        for(var j=0;j<properties.length;j++){
            var hr = theaderRow.insertCell()
            hr.innerHTML = properties[j].label
        }
        var hr = theaderRow.insertCell() // hand
        hr.innerHTML = 'hand'
        // player rows
        for(var i=0;i<gameVar.players.length;i++){
            if(gameVar.players[i].isIn){
                var tr = tbody.insertRow()
                // current player
                if(i===gameVar.currentPlayerIndex){
                    tr.classList.add('table-row-current-player') 
                }
                for(var j=0;j<properties.length;j++){
                    var td = tr.insertCell()
                    td.innerHTML = gameVar.players[i][properties[j].id]
                }
                // hand
                var td = tr.insertCell()
                td.innerHTML = gameVar.players[i].handToString()
            }
        }
        $("#data-table").html(table)
    }
    /**
     * re-renders table and UI elements
     * also handels when UI is disabled
     */
    function renderUI(){
        uiVar['deal-button'].disabled = uiVar.stepClicks >= 1

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