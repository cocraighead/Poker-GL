export function pokerlogic(){
    var uiVar = {stepClicks:0,checkFlopToggle:false,peekCardsToggle:false}
    document.addEventListener('DOMContentLoaded', function(event){
        _mainPokerLogic();
    });

    function _mainPokerLogic(){
        uiSetup()
    };

    function stepClicked(){
        uiVar.stepClicks += 1

    }

    function resetClicked(){
        uiVar.stepClicks = 0
        uiVar.checkFlopToggle = false
        uiVar.peekCardsToggle = false
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
        
        var element = document.getElementById('step-button');
        element.addEventListener('click',stepClicked)
        var element = document.getElementById('reset-button');
        element.addEventListener('click',resetClicked)
        var element = document.getElementById('check-flop-button');
        element.addEventListener('click',checkFlopClicked)
        var element = document.getElementById('peek-cards-button');
        element.addEventListener('click',peekCardsClicked)
    }

    return uiVar
}