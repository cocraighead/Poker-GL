const fs = require('fs');
// const { isAsyncFunction } = require('util/types');


function addNormal(point1,point2,point3){
    var V = [
        point2[0] - point1[0],
        point2[1] - point1[1],
        point2[2] - point1[2]
    ] 
    var U = [
        point3[0] - point1[0],
        point3[1] - point1[1],
        point3[2] - point1[2]
    ]

    var VxU = [
        [V[1]*U[2] - V[2]*U[1]],
        [V[2]*U[0] - V[0]*U[2]],
        [V[0]*U[1] - V[2]*U[0]]
    ]

    var VxUMagnitude = Math.abs(Math.sqrt(VxU[0]*VxU[0] + VxU[1]*VxU[1] + VxU[2]*VxU[2]))

    VxU[0] /= VxUMagnitude
    VxU[1] /= VxUMagnitude
    VxU[2] /= VxUMagnitude

    point1.push(VxU[0])
    point2.push(VxU[1])
    point3.push(VxU[2])
}

function addColor(point){

    point.push(.5)
    point.push(.5)
    point.push(.5)
}

function addTexture(point,T,isLeft,faceUp){
    var S = isLeft ?
        faceUp ? .5 : 0
        : faceUp ? 1 : .5

    point.push(S)
    point.push(T)
}

function flatten2DArray(_2dArray){
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

function generateBentFace(isTop){
    var buffer = []
    var numCuts = 100
    var cutFraction = 1/numCuts
    var z_start = -1
    var z_end = 1
    var z_diff = z_end - z_start
    var z_delta = z_diff / numCuts

    var y_shift = isTop ? .001 : -.001

    for(var i=0;i<numCuts;i++){
        var z1 = z_start + i * z_delta
        var z2 = z_start + (i+1) * z_delta

        var y1 = 10 ** (z1 - 1) + y_shift
        var y2 = 10 ** (z2 - 1) + y_shift

        var point1 = [-1, y1, z1]
        var point2 = [1, y1, z1]
        var point3 = [-1, y2, z2]

        var point4 = [1, y1, z1]
        var point5 = [1, y2, z2]
        var point6 = [-1, y2, z2]
        

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

        if(isTop){
            addTexture(point2,i*cutFraction,false,!isTop)
            addTexture(point1,i*cutFraction,true,!isTop)
            addTexture(point3,(i+1)*cutFraction,true,!isTop)
            addTexture(point5,(i+1)*cutFraction,true,!isTop)
            addTexture(point4,i*cutFraction,false,!isTop)
            addTexture(point6,(i+1)*cutFraction,false,!isTop)

            buffer.push(point2)
            buffer.push(point1)
            buffer.push(point3)
            buffer.push(point5)
            buffer.push(point4)
            buffer.push(point6)
        }else{
            addTexture(point1,i*cutFraction,!true,!isTop)
            addTexture(point2,i*cutFraction,!false,!isTop)
            addTexture(point3,(i+1)*cutFraction,!true,!isTop)
            addTexture(point4,i*cutFraction,!false,!isTop)
            addTexture(point5,(i+1)*cutFraction,!false,!isTop)
            addTexture(point6,(i+1)*cutFraction,!true,!isTop)
    
            buffer.push(point1)
            buffer.push(point2)
            buffer.push(point3)
            buffer.push(point4)
            buffer.push(point5)
            buffer.push(point6)
        }
    }
    return flatten2DArray(buffer)
}

function generateSideFace(isRight){
    var buffer = []
    var numCuts = 100
    var z_start = -1
    var z_end = 1
    var z_diff = z_end - z_start
    var z_delta = z_diff / numCuts

    var x_shift = isRight ? 1 : -1

    var y_shift = .001

    for(var i=0;i<numCuts;i++){
        var z1 = z_start + i * z_delta
        var z2 = z_start + (i+1) * z_delta

        var y1 = 10 ** (z1 - 1)
        var y2 = 10 ** (z2 - 1)

        var point1 = [x_shift, y1-y_shift, z1]
        var point2 = [x_shift, y1+y_shift, z1]
        var point3 = [x_shift, y2+y_shift, z2]

        var point4 = [x_shift, y2+y_shift, z2]
        var point5 = [x_shift, y2-y_shift, z2]
        var point6 = [x_shift, y1-y_shift, z1]

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

        addTexture(point1,0,true,false)
        addTexture(point2,0,false,false)
        addTexture(point3,0,true,false)
        addTexture(point4,0,false,false)
        addTexture(point5,0,true,false)
        addTexture(point6,0,false,false)

        buffer.push(point1)
        buffer.push(point2)
        buffer.push(point3)
        buffer.push(point4)
        buffer.push(point5)
        buffer.push(point6)
    }
    return flatten2DArray(buffer)
}

function generateFront(){
    var buffer = []
    var numCuts = 100
    var z_start = -1
    var z_end = 1
    var z_diff = z_end - z_start
    var z_delta = z_diff / numCuts

    var y_shift = .001

    for(var i=0;i<numCuts;i++){
        var z2 = z_start + (i+1) * z_delta

        var y2 = 10 ** (z2 - 1)
    }

    var point1 = [-1, y2+y_shift, 1]
    var point2 = [-1, y2-y_shift, 1]
    var point3 = [+1, y2+y_shift, 1]

    var point4 = [-1, y2-y_shift, 1]
    var point5 = [+1, y2-y_shift, 1]
    var point6 = [+1, y2+y_shift, 1]

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

    addTexture(point1,0,true,false)
    addTexture(point2,0,false,false)
    addTexture(point3,0,true,false)
    addTexture(point4,0,false,false)
    addTexture(point5,0,true,false)
    addTexture(point6,0,false,false)

    buffer.push(point1)
    buffer.push(point2)
    buffer.push(point3)
    buffer.push(point4)
    buffer.push(point5)
    buffer.push(point6)
    return flatten2DArray(buffer)
}

function generateBack(){
    var buffer = []

    var y_shift = .001

    var point1 = [+1, -y_shift, -1]
    var point2 = [-1, +y_shift, -1]
    var point3 = [+1, +y_shift, -1]

    var point4 = [+1, -y_shift, -1]
    var point5 = [-1, -y_shift, -1]
    var point6 = [-1, +y_shift, -1]

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

    addTexture(point1,0,true,false)
    addTexture(point2,0,false,false)
    addTexture(point3,0,true,false)
    addTexture(point4,0,false,false)
    addTexture(point5,0,true,false)
    addTexture(point6,0,false,false)

    buffer.push(point1)
    buffer.push(point2)
    buffer.push(point3)
    buffer.push(point4)
    buffer.push(point5)
    buffer.push(point6)
    return flatten2DArray(buffer)
}

function generateBuffer()
{
    var lowerBentFace = generateBentFace(false)
    var upperBentFace = generateBentFace(true)
    var leftFace = generateSideFace(false)
    var rightFace = generateSideFace(true)
    var frontFace =  generateFront()
    var backFace = generateBack()

    var faces = [lowerBentFace,upperBentFace,leftFace,rightFace,frontFace,backFace]
    // var faces = [lowerBentFace,upperBentFace,leftFace,rightFace]
    var buffer = []
    for(var f=0;f<faces.length;f++){
        buffer = buffer.concat(faces[f])
    }
    return buffer
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
console.log(r.length)
writeToFile(r,11)