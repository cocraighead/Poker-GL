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
            this.summaryMessage = 'Welcome to a new game of poker gl'
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
            this.runOutFuse = false
            this.board = []
            this.deck = new Deck(this.suites,this.cardNumbersStart,this.cardNumbersEnd)
            this.deck.shuffle(1)
            this.dealerIndex = this.dealerIndex !== undefined ? (this.dealerIndex+1)%this.numberOfPlayers : 0
            this.potTotal = 0
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
        findPlayer: function(pid){
            for(var i=0;i<this.players.length;i++){
                if(this.players[i].id === pid){
                    return this.players[i]
                }
            }
            return undefined
        },
        /**
         * When round ends determines winner and pays them out
         */
        endRoundPayout: function(){
            // loop through players who are in and find the best hand
            var winningPlayers = []
            var playersIn = []
            for(var i=0;i<this.players.length;i++){
                if(this.players[i].isIn){
                    playersIn.push(this.players[i])
                }
            }
            // one player in
            if(playersIn.length == 1){
                winningPlayers.push(playersIn[0])
            }else{ // find winner hand(s)
                // get hand strength
                var handStrengthDataArray = []
                for(var i=0;i<this.players.length;i++){
                    if(this.players[i].isIn){
                        handStrengthDataArray.push(
                            {
                                id: this.players[i].id,
                                handStrengthData: this.getHandStrength(this.players[i].hand,this.board)
                            }
                            
                        )
                    }
                }
                // sort hands best to worst
                handStrengthDataArray.sort((pData1,pData2)=>{
                    return this.compareHands(pData1.handStrengthData,pData2.handStrengthData)
                })
                handStrengthDataArray.reverse()
                // push winners
                winningPlayers.push(this.findPlayer(handStrengthDataArray[0].id))
                for(var i=1;i<handStrengthDataArray.length;i++){
                    // ties player 1
                    if(this.compareHands(handStrengthDataArray[0].handStrengthData,handStrengthDataArray[i].handStrengthData) === 0){
                        winningPlayers.push(this.findPlayer(handStrengthDataArray[i].id))
                    }
                }
            }
            // pay player(s) and message winnings
            var winningHandType = handStrengthDataArray[0].handStrengthData.name
            this.summaryMessage = ''
            for(var i=0;i<winningPlayers.length;i++){
                var splitWinnings = this.potTotal / winningPlayers.length
                winningPlayers[i].total += splitWinnings // no rounding
                this.summaryMessage +=
                    'Player #' + winningPlayers[i].id + ' won $' + splitWinnings +
                    ' with ' + winningPlayers[i].handToString() + ' (' + winningHandType + '). '
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
            // all players are all in - run out
            var playersWithMoneyBehind = 0
            for(var i=0;i<this.numberOfPlayers;i++){
                if(this.players[i].isIn && this.players[i].total > 0){
                    playersWithMoneyBehind += 1
                }
            }
            if(playersWithMoneyBehind === 0){
                // no street after the river so next round
                if(uiVar.stepClicks == 6){
                    // next round
                    return {index:this.currentPlayerIndex,newStreet:false,newRound:true}
                }else{
                    // next street - but run out to river
                    this.runOutFuse = true
                    return {index:this.currentPlayerIndex,newStreet:true,newRound:false}
                } 
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
                    // no street after the river so next round
                    if(uiVar.stepClicks == 6){
                        // next round
                        return {index:this.currentPlayerIndex,newStreet:false,newRound:true}
                    }else{
                        // next street
                        return {index:iPlayer,newStreet:true,newRound:false}
                    }
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
            }
            // players are all in so they are really just checking all the way
            if(this.runOutFuse){
                // run slowly so we see it
                setTimeout(()=>{checkClicked()}, 4000)
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
            this.potTotal += amount
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
        },
        /**
         * Creates a deep copy of two arrays concated together
         * @param {*} hand - array1
         * @param {*} board - array2
         * @returns - new array
         */
        createHandAndBoard: function(hand,board){
            var deepcopys = []
            for(var i=0;i<hand.length;i++){
                deepcopys.push(
                    new Card(hand[i].suite,hand[i].number)
                )
            }
            for(var i=0;i<board.length;i++){
                deepcopys.push(
                    new Card(board[i].suite,board[i].number)
                )
            }
            return deepcopys
        },
        /**
         * finds X cards of the same # and removes them from handAndboard
         * sorts handAndboard
         * @param {*} handAndboard - array of cards
         * @param {*} X - number of same cards - 2=pair, 3=trips, ext
         * @returns pair's number or -1
         */
        findXPair: function(handAndboard,X){
            // count card occurences
            var cardNumHash = {}
            for(var i=Number(this.cardNumbersStart);i<=Number(this.cardNumbersEnd);i++){
                cardNumHash[i] = 0
            }
            for(var i=0;i<handAndboard.length;i++){
                cardNumHash[handAndboard[i].number] += 1
            }
            // find occurace of pair
            var pairNumber = -1
            for(var i=Number(this.cardNumbersEnd);i>=Number(this.cardNumbersStart);i--){
                if(pairNumber < 0 && cardNumHash[i] == X){
                    pairNumber = i
                }
            }
            // found pair
            if(pairNumber >= 0){
                // remove each card in the pair
                for(var c=0;c<X;c++){
                    var removedFlag = false
                    var removeIndex = -1
                    for(var i=0;i<handAndboard.length;i++){
                        if(!removedFlag && handAndboard[i].number == pairNumber){
                            removeIndex = i
                        }
                    }
                    handAndboard.splice(removeIndex, 1)
                }
                // sort hand and bord for finding kickers
                handAndboard.sort(Card.compare).reverse()
            }
            return pairNumber
        },
        /**
         * finds two pair in handAndboard
         * @param {*} handAndboard - array of cards
         * @returns - {pair1Num,pair2Num,kicker}
         */
        findTwoPair: function(handAndboard){
            // find pair
            var pairNumber = this.findXPair(handAndboard,2)
            if(pairNumber >= 0){
                // find pair in remaining
                var pairNumber2 = this.findXPair(handAndboard,2)
                if(pairNumber2 >= 0){
                    return {
                        pair1Num: pairNumber,
                        pair2Num: pairNumber2,
                        kicker: handAndboard[0] ? handAndboard[0].number : undefined // not all cards are delt
                    }
                }
            }
            return undefined
        },
        /**
         * finds full house in handAndboard
         * @param {*} handAndboard - array of cards
         * @returns - {tripsNumber,pairNumber}
         */
        findFullHouse: function(handAndboard){
            // find trips
            var tripsNumber = this.findXPair(handAndboard,3)
            if(tripsNumber >= 0){
                // find pair in remaining
                var pairNumber = this.findXPair(handAndboard,2)
                if(pairNumber >= 0){
                    return {
                        tripsNumber: tripsNumber,
                        pairNumber: pairNumber,
                    }
                }
            }
            return undefined
        },
        /**
         * finds a straight in handAndboard
         * sorts handAndboard
         * @param {*} handAndboard - array of cards
         * @param {*} straightLength - length of staight to find
         * @returns - straightStartIndex | -1 if no straight
         */
        findStraight: function(handAndboard,straightLength){
            // sort decending
            handAndboard.sort(Card.compare).reverse()
            var straightStartIndex = -1
            // check if cards are the correct spacing
            // for example [A,Q,J,10,9,8,6,4] Q(i=1) and 8(i=5) are 4 apart in index and value
            // Edge case   [A,Q,J,J',9,8,6,4] Q(i=1) and 8(i=5) are 4 apart in index and value, but theres repeats
            for(var i=0;i<=handAndboard.length-straightLength;i++){
                if(
                    straightStartIndex < 0 &&
                    (handAndboard[i].number - handAndboard[i+straightLength-1].number) === straightLength-1
                ){
                    var repeatsFlag = false
                    var repeatDictionary = {}
                    for(var j=i;j<=i+straightLength-1;j++){
                        if(repeatDictionary[handAndboard[j].number]){
                            repeatsFlag = true
                        }
                        repeatDictionary[handAndboard[j].number] = true
                    }
                    if(!repeatsFlag){
                        straightStartIndex = i
                    }
                }
            }
            return straightStartIndex
        },
        /**
         * finds flush in handAndboard, removes non-flush cards from handAndboard
         * @param {*} handAndboard - array of cards
         * @param {*} flushSize - size of staight to find
         * @returns - flushSuite|| undefined
         */
        findFlush: function(handAndboard,flushSize){
            handAndboard.sort(Card.compare).reverse()
            // get counts for each suite
            var suiteCount = {}
            var flushSuite = undefined
            for(var i=0;i<this.suites.length;i++){
                suiteCount[this.suites[i]] = 0
            }
            for(var i=0;i<handAndboard.length;i++){
                suiteCount[handAndboard[i].suite] += 1
                if(suiteCount[handAndboard[i].suite] >= flushSize){
                    flushSuite = handAndboard[i].suite
                }
            }
            // if there is a flush
            // remove all cards not in that suite
            if(flushSuite){
                for(var i=0;i<handAndboard.length-flushSize;i++){
                    var removeIndex = -1
                    for(var j=0;j<handAndboard.length;j++){
                        if(removeIndex < 0 && handAndboard[j].suite !== flushSuite){
                            removeIndex = j
                        }
                    }
                    if(removeIndex >= 0){
                        handAndboard.splice(removeIndex, 1)
                    }
                }
                return flushSuite
            }
            return undefined
        },
        /**
         * finds a s&f in handAndboard, removes non-flush cards from handAndboard, sorts hand and board
         * @param {*} handAndboard - array of cards
         * @param {*} size - size of s&f
         * @returns - straightStartIndex
         */
        findStraightFlush: function(handAndboard,size){
            var straightStartIndex = -1
            var flushSuite = this.findFlush(handAndboard,size)
            if(flushSuite){
                // find stright in handAndboard which has been reduced to flush cards
                var straightStartIndex = this.findStraight(handAndboard,size)
            }
            return straightStartIndex
        },
        /**
         * Gets a hand stength based of board - doesn't change hand or board
         * @param {*} hand - array of cards
         * @param {*} board - array of cards
         * @returns - see ret
         */
        getHandStrength: function(hand,board){
            // format is
            // {
            //     handStrength: #0-8, // 0-high card, 1-pair, 2-2 pair, 3-trips, 4-straight, 5-flush, 6-boat, 7-quands, 8-straight flush
            //     tiebreaks: [
            //         #1-14 || undefined, // rank of tie break 0
            //         #1-14 || undefined, // rank of tie break 1
            //         #1-14 || undefined, // rank of tie break 2
            //         #1-14 || undefined, // rank of tie break 3
            //         #1-14 || undefined, // rank of tie break 5
            //     ]
            // }
            var flushSize = 5
            var straightLength = 5
            var ret = {
                handStrength: 0,
                tiebreaks: [undefined,undefined,undefined,undefined,undefined],
                name: ''
            }

            // 8 - straight flush
            var handAndboard_8 = this.createHandAndBoard(hand,board)
            var straightFlushStartIndex = this.findStraightFlush(handAndboard_8,straightLength)
            if(straightFlushStartIndex >= 0){
                ret.handStrength = 8
                ret.name = 'straight flush'
                for(var i=straightFlushStartIndex;i<straightFlushStartIndex+straightLength;i++){
                    ret.tiebreaks[i] = handAndboard_8[i].number
                }
                return ret
            }
            // 7 - quads
            var handAndboard_7 = this.createHandAndBoard(hand,board)
            var quadsNumber = this.findXPair(handAndboard_7,4)
            if(quadsNumber >= 0){
                ret.handStrength = 7
                ret.name = 'quads'
                ret.tiebreaks[0] = quadsNumber
                ret.tiebreaks[1] = handAndboard_7[0] ? handAndboard_7[0].number : undefined // not all cards are delt
                return ret 
            }
            // 6 - full house
            var handAndboard_6 = this.createHandAndBoard(hand,board)
            var fullHouseData = this.findFullHouse(handAndboard_6)
            if(fullHouseData){
                ret.handStrength = 6
                ret.name = 'full house'
                ret.tiebreaks[0] = fullHouseData.tripsNumber
                ret.tiebreaks[1] = fullHouseData.pairNumber
                return ret
            }
            // 5 - flush
            var handAndboard_5 = this.createHandAndBoard(hand,board)
            var flushSuite = this.findFlush(handAndboard_5,flushSize)
            if(flushSuite){
                ret.handStrength = 5
                ret.name = 'flush'
                for(var i=0;i<flushSize;i++){
                    ret.tiebreaks[i] = handAndboard_5[i].number
                }
                return ret
            }
            // 4 - straight
            var handAndboard_4 = this.createHandAndBoard(hand,board)
            var straightStartIndex = this.findStraight(handAndboard_4,straightLength)
            if(straightStartIndex >= 0){
                ret.handStrength = 4
                ret.name = 'straight'
                for(var i=straightStartIndex;i<straightStartIndex+straightLength;i++){
                    ret.tiebreaks[i] = handAndboard_4[i].number
                }
                return ret
            }
            // 3 - trips
            var handAndboard_3 = this.createHandAndBoard(hand,board)
            var tripsNumber = this.findXPair(handAndboard_3,3)
            if(tripsNumber >= 0){
                ret.handStrength = 3
                ret.name = 'trips'
                ret.tiebreaks[0] = tripsNumber
                ret.tiebreaks[1] = handAndboard_3[0] ? handAndboard_3[0].number : undefined // not all cards are delt
                ret.tiebreaks[2] = handAndboard_3[1] ? handAndboard_3[1].number : undefined
                return ret 
            }
            // 2 - two pair
            var handAndboard_2 = this.createHandAndBoard(hand,board)
            var twoPairData = this.findTwoPair(handAndboard_2)
            if(twoPairData){
                ret.handStrength = 2
                ret.name = 'two pair'
                ret.tiebreaks[0] = twoPairData.pair1Num
                ret.tiebreaks[1] = twoPairData.pair2Num
                ret.tiebreaks[2] = twoPairData.kicker
                return ret
            }
            // 1 - pair
            var handAndboard_1 = this.createHandAndBoard(hand,board)
            var pairNumber = this.findXPair(handAndboard_1,2)
            if(pairNumber >= 0){
                ret.handStrength = 1
                ret.name = 'pair'
                ret.tiebreaks[0] = pairNumber
                ret.tiebreaks[1] = handAndboard_1[0] ? handAndboard_1[0].number : undefined // not all cards are delt
                ret.tiebreaks[2] = handAndboard_1[1] ? handAndboard_1[1].number : undefined
                ret.tiebreaks[3] = handAndboard_1[2] ? handAndboard_1[2].number : undefined
                return ret 
            }
            // 0 - high card
            var handAndboard_0 = this.createHandAndBoard(hand,board)
            handAndboard_0.sort(Card.compare).reverse()
            ret.handStrength = 0
            ret.name = 'high card'
            for(var i=0;i<5;i++){
                ret.tiebreaks[i] = handAndboard_0[i] ? handAndboard_0[i].number : undefined // not all cards are delt
            }
            return ret
        },
        /**
         * uses hand strength and tie breaks to compare hands
         * uses js sort conventions
         * @param {*} strengthObject0 
         * @param {*} strengthObject1 
         * @returns 
         */
        compareHands: function(strengthObject0,strengthObject1){
            // get hand strength
            // var strengthObject0 = this.getHandStrength(hand0,board)
            // var strengthObject1 = this.getHandStrength(hand1,board)
            // better hand 0
            if(strengthObject0.handStrength > strengthObject1.handStrength){
                return 1
            }else if(strengthObject0.handStrength < strengthObject1.handStrength){
                // better hand 1
                return -1
            }else{
                // same hand type
                for(var i=0;i<strengthObject0.tiebreaks.length;i++){
                    if(
                        strengthObject0.tiebreaks[i] !== undefined &&
                        strengthObject1.tiebreaks[i] !== undefined &&
                        strengthObject0.tiebreaks[i] > strengthObject1.tiebreaks[i]
                    ){
                        return 1
                    }else if(
                        strengthObject0.tiebreaks[i] !== undefined &&
                        strengthObject1.tiebreaks[i] !== undefined &&
                        strengthObject0.tiebreaks[i] < strengthObject1.tiebreaks[i]
                    ){
                        return -1
                    }
                }
            }
            return 0
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
            gameVar.endRoundPayout()
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
            gameVar.endRoundPayout()
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
            gameVar.endRoundPayout()
            gameVar.setUpRound()
        }
        renderUI()
    }
    /**
     * Validates the attempted raise
     */
    function validRaise(raiseInputValue){
        // invalid type
        if(!raiseInputValue || isNaN(raiseInputValue)){
            return false
        }
        // invalid amount
        if(raiseInputValue <= 0){
            return false
        }
        var maxTotalInPot = gameVar.maxTotalInPot(gameVar.currentPlayerIndex)
        var currentPlayerTotalInPot = gameVar.players[gameVar.currentPlayerIndex].totalInPot
        var maxTotalDiff = maxTotalInPot - currentPlayerTotalInPot
        // must be a true raise 
        if(maxTotalDiff < 0){
            alert('Raiseing on your own raise. This should not occur')
            return false
        }else if(raiseInputValue < maxTotalDiff){
            // raise is less than other's raises
            return false
        }
        // can go negitive on a raise
        if(gameVar.players[gameVar.currentPlayerIndex].total < raiseInputValue){
            return false
        }
        return true
    }
    /**
     * event when raise btn is clicked
     */
    function raiseClicked(){
        var raiseInputValue = document.getElementById('raise-input').value
        raiseInputValue = Number(raiseInputValue)
        if(!validRaise(raiseInputValue)){
            return false
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
            {id:'id',label:'P#'},
            {id:'total',label:'$stack'},
            {id:'totalInPot',label:'$inPot'}
        ]
        for(var j=0;j<properties.length;j++){
            var hr = theaderRow.insertCell()
            hr.innerHTML = properties[j].label
        }
        var hr = theaderRow.insertCell() // hand
        hr.innerHTML = 'cards'
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
                    // dealer
                    if(i===gameVar.dealerIndex && properties[j].id === 'id'){
                        td.innerHTML += '<sub>d</sub>'
                    }
                }
                // hand
                var td = tr.insertCell()
                td.innerHTML = gameVar.players[i].handToString()
                var td = tr.insertCell()
                if(gameVar.players[i].hand.length){
                    var handStrength = gameVar.getHandStrength(gameVar.players[i].hand,gameVar.board)
                    td.innerHTML = handStrength.name
                }else{
                    td.innerHTML = ''
                }
            }
        }
        $("#data-table").html(table)
    }
    /**
     * re-renders summary data on ui like pot total
     */
    function uiSummaryDataUpdate(){
        $("#summary-message").html(gameVar.summaryMessage)
        $("#pot-total").html('$'+gameVar.potTotal)
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
            gameVar.runOutFuse ||
            gameVar.players[gameVar.currentPlayerIndex].totalInPot < gameVar.maxTotalInPot(gameVar.currentPlayerIndex)
        
        uiVar['fold-button'].disabled = uiVar.stepClicks < 1 || gameVar.runOutFuse

        uiVar['call-button'].disabled = uiVar.stepClicks < 1 ||
            gameVar.runOutFuse ||
            gameVar.players[gameVar.currentPlayerIndex].totalInPot >= gameVar.maxTotalInPot(gameVar.currentPlayerIndex)

        uiVar['raise-button'].disabled = uiVar.stepClicks < 1 || gameVar.runOutFuse

        uiSummaryDataUpdate()
        uiTableUpdate()
    }

    return {uiVar,gameVar}
}