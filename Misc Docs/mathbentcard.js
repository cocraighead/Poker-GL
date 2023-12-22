const fs = require('fs');
// const { isAsyncFunction } = require('util/types');


function addNormal(point){
    var n1 = 0
    var n2 = 0
    var n3 = 1

    point.push(n1)
    point.push(n2)
    point.push(n3)
}

function addColor(point){

    point.push(.5)
    point.push(.5)
    point.push(.5)
}

function addTexture(point,isLeft){
    var T = isLeft ? .5 : 1
    var S = (point[3] + 1) / 2

    point.push(S)
    point.push(T)
}

function fatten2DArray(_2dArray){
    var d1 = _2dArray.length
    var d2 = d1 ? _2dArray[0].length : 0

    var flatArr = []

    for(var i=0;i<d1;i++){
        for(var j=0;j<d2;j++){
            flatArr.push(_2dArray[i][j])
        }
    }
    return flatArr
}

function generateBuffer()
{
    var buffer = []
    var numCuts = 100
    var z_start = -1
    var z_end = 1
    var z_diff = z_end - z_start
    var z_delta = z_diff / numCuts

    for(var i=0;i<numCuts;i++){
        var z1 = z_start + i * z_delta
        var z2 = z_start + (i+1) * z_delta

        var y1 = 10 ** (z1 - 1)
        var y2 = 10 ** (z2 - 1)

        var point1 = [-1, y1, z1]
        var point2 = [1, y1, z1]
        var point3 = [-1, y2, z2]

        var point4 = [1, y1, z1]
        var point5 = [-1, y2, z2]
        var point6 = [1, y2, z2]

        addNormal(point1)
        addNormal(point2)
        addNormal(point3)
        addNormal(point4)
        addNormal(point5)
        addNormal(point6)

        addColor(point1)
        addColor(point2)
        addColor(point3)
        addColor(point4)
        addColor(point5)
        addColor(point6)

        addTexture(point1,true)
        addTexture(point2,false)
        addTexture(point3,true)
        addTexture(point4,false)
        addTexture(point5,true)
        addTexture(point6,false)

        buffer.push(point1)
        buffer.push(point2)
        buffer.push(point3)
        buffer.push(point4)
        buffer.push(point5)
        buffer.push(point6)
    }
    console.log('Number of points', buffer.length)
    return fatten2DArray(buffer)
}

function writeToFile(arr,valuesInRow){
    var data = '['

    for(var i=0;i<arr.length;i++){
        if(i  % valuesInRow === 0){
            data += '\n\t'
        }
        data += arr[i]
        if(i !== arr.length-1){
            data += ','
        }
    }

    data += '\n]'

    fs.writeFile('mathBentCard.txt', data, err => {
        if (err) {
            console.error(err);
        }
    });
}

var r = generateBuffer()
writeToFile(r,11)