/**
 * @author Mat Groves http://matgroves.com/ @Doormat23
 */

/*
* @class Matrix
* The Matrix class will choose the best type of array to use between
* a regular javascript Array and a Float32Array if the latter is available
*
*/
PIXI.determineMatrixArrayType = function() {
    return (typeof Float32Array !== 'undefined') ? Float32Array : Array;
};

PIXI.Matrix2 = PIXI.determineMatrixArrayType();

PIXI.Matrix = function()
{
    this.a = 1;
    this.b = 0;
    this.c = 0;
    this.d = 1;
    this.tx = 0;
    this.ty = 0;
};

PIXI.Matrix.prototype.fromArray = function(array)
{
    this.a = array[0];
    this.b = array[1];
    this.c = array[3];
    this.d = array[4];
    this.tx = array[2];
    this.ty = array[5];
};

PIXI.Matrix.prototype.toArray = function(transpose)
{
    if(!this.array) this.array = new Float32Array(9);
    var array = this.array;

    if(transpose)
    {
        this.array[0] = this.a;
        this.array[1] = this.c;
        this.array[2] = 0;
        this.array[3] = this.b;
        this.array[4] = this.d;
        this.array[5] = 0;
        this.array[6] = this.tx;
        this.array[7] = this.ty;
        this.array[8] = 1;
    }
    else
    {
        this.array[0] = this.a;
        this.array[1] = this.b;
        this.array[2] = this.tx;
        this.array[3] = this.c;
        this.array[4] = this.d;
        this.array[5] = this.ty;
        this.array[6] = 0;
        this.array[7] = 0;
        this.array[8] = 1;
    }

    return array;//[this.a, this.b, this.tx, this.c, this.d, this.ty, 0, 0, 1];
};

PIXI.identityMatrix = new PIXI.Matrix();