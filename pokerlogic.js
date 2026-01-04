import {Deck} from './Classes/Deck.js'
import {Player} from './Classes/Player.js'
import {Card} from './Classes/Card.js'
import {Template} from './Classes/Template.js'

export function pokerlogic(){
    // UI Elements
    var uiVar = {
        'deal-button': document.getElementById('deal-button'),
        'check-button': document.getElementById('check-button'),
        'fold-button': document.getElementById('fold-button'),
        'call-button': document.getElementById('call-button'),
        'raise-button': document.getElementById('raise-button'),
        'raise-input': document.getElementById('raise-input'),
        'raise-error-message': document.getElementById('raise-error-message'),
        'pot-total-display': document.getElementById('pot-total-display'),
        'local-player-stack': document.getElementById('local-player-stack')
    }

    // Game Logic and State
    var gameVar = {
        suites: ['c','s','h','d'],
        cardNumbersStart: '2',
        cardNumbersEnd: '14',
        numberOfPlayers: 5,
        smallBlind: 1,
        bigBlind: 3,
        localPlayerIndex: -1,
        lastRaiseAmount: 3, // Tracks the increment of the last raise for the "Full Bet Rule"
        
        setUpGame: function(){
            this.localPlayerIndex = 0;
            this.players = [];
            for(var i=0; i<this.numberOfPlayers; i++){
                this.players.push(new Player(i));
                if(i == this.localPlayerIndex) this.players[i].name = 'Me';
            }
            this.setUpRound();
        },

        setUpRound: function(){
            this.board = [];
            this.deck = new Deck(this.suites, this.cardNumbersStart, this.cardNumbersEnd);
            this.deck.shuffle(1);
            this.dealerIndex = this.dealerIndex !== undefined ? (this.dealerIndex + 1) % this.numberOfPlayers : 0;
            this.potTotal = 0;
            this.raiseErrorMessage = '';
            this.lastRaiseAmount = this.bigBlind; // Reset raise increment to Big Blind for the start of the round

            for(var i=0; i<this.numberOfPlayers; i++){
                this.players[i].hand = [this.deck.pop(), this.deck.pop()];
                this.players[i].isIn = true;
                this.players[i].totalInPot = 0;
            }
            
            // Initial Blinds
            this.bet(this.smallBlind, (this.dealerIndex + 1) % this.numberOfPlayers);
            this.bet(this.bigBlind, (this.dealerIndex + 2) % this.numberOfPlayers);
            
            // First person to act after blinds (Under the Gun)
            this.serverPlayerIndex = (this.dealerIndex + 3) % this.numberOfPlayers;
            
            this.setUpStreet();
            renderUI();
        },

        setUpStreet: function(){
            this.lastRaiseAmount = 0; // Reset raise increment for new street (flop/turn/river)
            for(var i=0; i<this.numberOfPlayers; i++){
                this.players[i].firstTurnOnStreet = true;
            }
        },

        bet: function(amount, playerIndex){
            this.players[playerIndex].total -= amount;
            this.players[playerIndex].totalInPot += amount;
            this.potTotal += amount;
        },

        maxTotalInPot: function(activePlayerIndex){
            var max = 0;
            for(var i=0; i<this.players.length; i++){
                if(this.players[i].totalInPot > max) max = this.players[i].totalInPot;
            }
            return max;
        },

        validRaise: function(raiseValue){
            var currentMax = this.maxTotalInPot(this.serverPlayerIndex);
            var player = this.players[this.serverPlayerIndex];
            var callAmount = currentMax - player.totalInPot;
            
            // The "Full Bet Rule": next raise must be at least the previous raise increment
            var minIncrement = (this.lastRaiseAmount === 0) ? this.bigBlind : this.lastRaiseAmount;
            var minTotalInput = callAmount + minIncrement;

            if(isNaN(raiseValue) || raiseValue < minTotalInput){
                this.raiseErrorMessage = 'Min raise is $' + minTotalInput;
                return false;
            }
            if(player.total < raiseValue){
                this.raiseErrorMessage = "Not enough chips";
                return false;
            }

            // Update increment: if opening, it's the whole bet. If raising, it's the part above the currentMax.
            this.lastRaiseAmount = (currentMax === 0) ? raiseValue : (raiseValue - callAmount);
            this.raiseErrorMessage = '';
            return true;
        }
    }

    /**
     * Updates the HTML elements and draws the two player columns
     */
    function renderUI(){
        // Get columns from your updated poker.html
        const leftCol = document.getElementById('players-left');
        const rightCol = document.getElementById('players-right');
        
        if (leftCol && rightCol) {
            leftCol.innerHTML = ''; 
            rightCol.innerHTML = '';

            gameVar.players.forEach((p, i) => {
                const playerDiv = document.createElement('div');
                // Check if this player is currently the active one
                const isActive = (i === gameVar.serverPlayerIndex);
                playerDiv.className = `player-card ${isActive ? 'active' : ''} ${!p.isIn ? 'folded' : ''}`;
                
                playerDiv.innerHTML = `
                    <div class="p-name"><b>${p.name}</b></div>
                    <div class="p-stack">Stack: $${p.total}</div>
                    <div class="p-bet">${p.totalInPot > 0 ? 'Bet: $' + p.totalInPot : '&nbsp;'}</div>
                `;

                // Split 5 players: 3 on left, 2 on right
                if(i < 3) leftCol.appendChild(playerDiv);
                else rightCol.appendChild(playerDiv);
            });
        }

        // Update Pots and Stacks
        if(uiVar['pot-total-display']) uiVar['pot-total-display'].innerText = '$' + gameVar.potTotal;
        if(uiVar['local-player-stack']) uiVar['local-player-stack'].innerText = '$' + gameVar.players[gameVar.localPlayerIndex].total;

        // Handle Raise Error Messages
        if(uiVar['raise-error-message']){
            uiVar['raise-error-message'].innerText = gameVar.raiseErrorMessage;
            uiVar['raise-error-message'].className = gameVar.raiseErrorMessage ? 'raise-error-message-show' : 'raise-error-message-hide';
        }

        // Dynamic Button Text (Check vs Call)
        const currentMax = gameVar.maxTotalInPot(gameVar.serverPlayerIndex);
        const currentPlayer = gameVar.players[gameVar.serverPlayerIndex];
        const callAmount = currentMax - currentPlayer.totalInPot;

        if(uiVar['check-button']) {
            uiVar['check-button'].style.display = callAmount > 0 ? 'none' : 'inline-block';
        }
        if(uiVar['call-button']) {
            uiVar['call-button'].style.display = callAmount > 0 ? 'inline-block' : 'none';
            uiVar['call-button'].innerText = `CALL $${callAmount}`;
        }
    }

    // Interaction Events
    document.getElementById('raise-button').onclick = () => {
        let val = parseInt(uiVar['raise-input'].value);
        if(gameVar.validRaise(val)){
            gameVar.bet(val, gameVar.serverPlayerIndex);
            // After a successful bet, you would typically call a function to move to the next player
            // For now, we just refresh the UI to show the results
            uiVar['raise-input'].value = ''; 
        }
        renderUI();
    };

    document.getElementById('deal-button').onclick = () => {
        gameVar.setUpRound();
    };

    // Return objects for webgl.js to use
    return {uiVar, gameVar}
}