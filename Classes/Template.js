var templates = {
    'guessCardModal': {
        string:'<div style="background-color: white; display: displayType; position: absolute; top: 100px; left: 110px; z-index:1;"> <div>hello world</div> </div>',
        parameters: [{'name':'displayType','value':'none'}],
    }
}

export class Template  {
    constructor(name,options) {
        this.name = name
        this.templateString = templates[name].string
        this.templateParameters = templates[name].parameters
        this.showing = false
        this.render()
    }
    render(){
        var fullTpl = this.insertParameters()
        $("#"+this.name).html(fullTpl)
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
        if(startOfParam == -1){return ''}
        return newString.substring(0,startOfParam) + parameter.value + newString.substring(startOfParam+String(parameter.name).length)
    }
}