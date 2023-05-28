const fs = require('fs');
const { isAsyncFunction } = require('util/types');


function readTextFile(file)
{
    fs.readFile(file, 'utf8', (err, data) => {
      if (err) {
        console.error(err);
        return;
      }
      actionFn(data)
    });
}

function writeTextFile(data){

    fs.writeFile('output.txt', data, err => {
        if (err) {
            console.error(err);
        }
    });
}

function actionFn(data){
    var vertexLines = []
    var normalLines = []
    var textureLines = []

    var facesLines = []
    
    var dataArr = data.split('\n')
    for(var i=0;i<dataArr.length;i++){
        var line = dataArr[i]
        if(line.substring(0,2) === 'v '){
            vertexLines.push(line.substring(2))
        }else if(line.substring(0,2) === 'vn'){
            normalLines.push(line.substring(3))
        }else if(line.substring(0,2) === 'vt'){
            textureLines.push(line.substring(3))
        }else if(line[0] === 'f'){
            facesLines.push(line.substring(2))
        }
    }

    var faces = []

    facesLines.forEach(line => {
        var sArr = line.split(' ')
        sArr.forEach(triangle => faces.push(triangle))
    });

    var bufferLines = []

    faces.forEach(face => {
        var arr = face.split('/')
        var pointIndex = arr[0]-1
        var textIndex = arr[1]-1
        var normIndex = arr[2]-1
        
        bufferLines.push(
            vertexLines[pointIndex].replaceAll(' ', ',') + ',' +
            normalLines[normIndex].replaceAll(' ', ',')  + ',' +
            '.5,.5,.5,' +
            textureLines[textIndex].replaceAll(' ', ',') + ',\n'
        )
    });

    writeTextFile(bufferLines.join(''))

}

readTextFile('C:\\Users\\Zed God\\Documents\\Code Docs\\Poker GL\\Misc Docs\\bent_card.obj')