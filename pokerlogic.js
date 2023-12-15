export function pokerlogic(){
    var uiVar = {uiElements:{},stepClicks:0,checkFlopToggle:false,peekCardsToggle:false}
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
        uiVar['step-button'] = document.getElementById('step-button');
        uiVar['step-button'].addEventListener('click',stepClicked)

        uiVar['reset-button'] = document.getElementById('reset-button');
        uiVar['reset-button'].addEventListener('click',resetClicked)

        uiVar['check-flop-button'] = document.getElementById('check-flop-button');
        uiVar['check-flop-button'].addEventListener('click',checkFlopClicked)

        uiVar['peek-cards-button'] = document.getElementById('peek-cards-button');
        uiVar['peek-cards-button'].addEventListener('click',peekCardsClicked)
    }

    function updateElementProperty(elementId, property, value){
        var element = uiVar.uiElements[elementId]
        if(element){
            element[property] = value
        }
    }

    return uiVar
}