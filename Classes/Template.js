var templates = {
    'game-logs-modal': {
        string:'<div style="background-color: white; display: block; position: absolute; top: 100px; left: 110px; z-index:1;"><div style="display: flex; flex-direction: column;">GAME_LOGS</div></div>',
        parameters: [{'name':'GAME_LOGS','value':''}],
    }
}

export class Template  {
    constructor(name,options) {
        this.name = name
        this.templateString = templates[name].string
        this.templateParameters = templates[name].parameters
        this.showing = false
    }
    render(){
        var fullTpl = this.insertParameters()
        this.showing = true
        $("#"+this.name).html(fullTpl)
    }
    remove(){
        this.showing = false
        $("#"+this.name)[0].firstChild.remove()
    }
    updateParameter(name,value){
        for(var i=0;i<this.templateParameters.length;i++){
            if(this.templateParameters[i].name == name){
                this.templateParameters[i].value = value
            }
        }
    }
    insertParameters(){
        var ret = (' ' + this.templateString).slice(1);
        for(var i=0;i<this.templateParameters.length;i++){
            ret = this.insertParameter(ret,this.templateParameters[i])
        }
        return ret
    }
    insertParameter(newString,parameter){
        var startOfParam = newString.indexOf(parameter.name)
        if(startOfParam == -1){return newString}
        return newString.substring(0,startOfParam) + parameter.value + newString.substring(startOfParam+String(parameter.name).length)
    }
}