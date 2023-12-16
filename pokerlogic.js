export function pokerlogic(){
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

    return uiVar
}