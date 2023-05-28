//
//  4x4 matrix functions
//    Matrices are interpreted as column major order using OpenGL convention
//    Javascript version adapted from CSCIx239.h
//  Willem A. (Vlakkies) Schreuder 2021
//

//
//  Constructor
//
mat4=function(m4)
{
   if (typeof m4=='object')
   {
      this.mat = m4.mat;
   }
   else
   {
      this.mat = [1,0,0,0 , 0,1,0,0 , 0,0,1,0 , 0,0,0,1];
   }
}

//
//  Identity 4x4 matrix
//
mat4.prototype.identity = function()
{
   this.mat = [1,0,0,0 , 0,1,0,0 , 0,0,1,0 , 0,0,0,1];
}

//
//  Right multiply 4x4 matrix
//
mat4.prototype.multMatrix = function(m)
{
   //  res = mat*m
   var res = [];
   for (i=0;i<4;i++)
      for (j=0;j<4;j++)
         res[4*i+j] = this.mat[j]*m[4*i] + this.mat[4+j]*m[4*i+1] + this.mat[8+j]*m[4*i+2] + this.mat[12+j]*m[4*i+3];
   //  Copy matrix back
   this.mat = res;
}

//
//  Rotate
//
mat4.prototype.rotate = function(th,x,y,z)
{
   //  Normalize axis
   var l = Math.sqrt(x*x+y*y+z*z);
   if (l==0) return;
   x /= l;
   y /= l;
   z /= l;
   //  Calculate sin and cos
   var s = Math.sin(th*Math.PI/180);
   var c = Math.cos(th*Math.PI/180);
   //  Rotation matrix
   var R =
   [
      (1-c)*x*x+c   , (1-c)*x*y+z*s , (1-c)*z*x-y*s , 0 ,
      (1-c)*x*y-z*s , (1-c)*y*y+c   , (1-c)*y*z+x*s , 0 ,
      (1-c)*z*x+y*s , (1-c)*y*z-x*s , (1-c)*z*z+c   , 0 ,
            0       ,       0       ,       0       , 1 ,
   ];
   //  Multiply
   this.multMatrix(R);
}

//
//  Translate
//
mat4.prototype.translate = function(dx,dy,dz)
{
   //  Scale matrix
   var T = [1,0,0,0 , 0,1,0,0 , 0,0,1,0 , dx,dy,dz,1];
   //  Multiply
   this.multMatrix(T);
}

//
//  Scale
//
mat4.prototype.scale = function(Sx,Sy,Sz)
{
   //  Scale matrix
   var S = [Sx,0,0,0 , 0,Sy,0,0 , 0,0,Sz,0 , 0,0,0,1];
   //  Multiply
   this.multMatrix(S);
}

//
//  Orthogonal projection matrix
//
mat4.prototype.ortho = function(left,right,bottom,top,near,far)
{
   //  Scale
   var Xs = 2/(right-left);
   var Ys = 2/(top-bottom);
   var Zs = -2/(far-near);
   //  Offset
   var X0 = -(right+left)/(right-left);
   var Y0 = -(top+bottom)/(top-bottom);
   var Z0 = -(far+near)/(far-near);
   //  Projection matrix
   var P = [Xs,0,0,0 , 0,Ys,0,0 , 0,0,Zs,0 , X0,Y0,Z0,1];
   //  Multiply
   this.multMatrix(P);
}

//
//  Perspective projection matrix
//
mat4.prototype.perspective = function(fovy,asp,zNear,zFar)
{
   //  Cotangent
   var s = Math.sin(fovy/2*Math.PI/180);
   var c = Math.cos(fovy/2*Math.PI/180);
   if (s==0) return;
   var cot = c/s;
   var Zs = -(zFar+zNear)/(zFar-zNear);
   var Z0 = -2*zNear*zFar/(zFar-zNear);
   //  Projection Matrix
   var P = [cot/asp,0,0,0 , 0,cot,0,0 , 0,0,Zs,-1 , 0,0,Z0,0];
   //  Multiply
   this.multMatrix(P);
}

//
//  Normalize vector
//
function normalize(x,y,z)
{
   var l = Math.sqrt(x*x+y*y+z*z);
   if (l==0) return [0,0,0];
   x /= l;
   y /= l;
   z /= l;
   return [x,y,z];
}

//
//  Set eye position
//
mat4.prototype.lookAt = function(Ex,Ey,Ez , Cx,Cy,Cz , Ux,Uy,Uz)
{
   //  Forward = C-E
   var [Fx,Fy,Fz] = normalize(Cx-Ex , Cy-Ey , Cz-Ez);
   // Side = Forward x Up
   var [Sx,Sy,Sz] = normalize(Fy*Uz-Uy*Fz , Fz*Ux-Uz*Fx , Fx*Uy-Ux*Fy);
   //  Recalculate Up = Side x Forward
   Ux = Sy*Fz-Fy*Sz;
   Uy = Sz*Fx-Fz*Sx;
   Uz = Sx*Fy-Fx*Sy;
   //  Rotation (inverse read transposed)
   var R =
   [
    Sx, Ux, -Fx, 0,
    Sy, Uy, -Fy, 0,
    Sz, Uz, -Fz, 0,
    0,  0,    0, 1,
   ];
   this.multMatrix(R);
   //  Set eye at the origin
   this.translate(-Ex,-Ey,-Ez);
}

//
// Compute inverse of a general 3d transformation matrix.
//    Adapted from graphics gems II.
//  Returned array is a Float32 array that can be passed to WebGL
// 
mat4.prototype.normalMatrix = function()
{
   // Calculate the determinant of upper left 3x3 submatrix
   var det = this.mat[0]*this.mat[5]*this.mat[10]
            +this.mat[1]*this.mat[6]*this.mat[8]
            +this.mat[2]*this.mat[4]*this.mat[9]
            -this.mat[2]*this.mat[5]*this.mat[8]
            -this.mat[1]*this.mat[4]*this.mat[10]
            -this.mat[0]*this.mat[6]*this.mat[9];
   //  Compute inverse using Cramer's rule
   var inv = [1,0,0 , 0,1,0 , 0,0,1];
   if (det*det>1e-25)
   {
      inv[0] =  (this.mat[5]*this.mat[10]-this.mat[6]*this.mat[9])/det;
      inv[1] = -(this.mat[4]*this.mat[10]-this.mat[6]*this.mat[8])/det;
      inv[2] =  (this.mat[4]*this.mat[ 9]-this.mat[5]*this.mat[8])/det;
      inv[3] = -(this.mat[1]*this.mat[10]-this.mat[2]*this.mat[9])/det;
      inv[4] =  (this.mat[0]*this.mat[10]-this.mat[2]*this.mat[8])/det;
      inv[5] = -(this.mat[0]*this.mat[ 9]-this.mat[1]*this.mat[8])/det;
      inv[6] =  (this.mat[1]*this.mat[ 6]-this.mat[2]*this.mat[5])/det;
      inv[7] = -(this.mat[0]*this.mat[ 6]-this.mat[2]*this.mat[4])/det;
      inv[8] =  (this.mat[0]*this.mat[ 5]-this.mat[1]*this.mat[4])/det;
   }
   return new Float32Array(inv);
}

//
//  Return matrix as Float32 array that can be passed to WebGL
//
mat4.prototype.getMat=function()
{
   return new Float32Array(this.mat);
};
