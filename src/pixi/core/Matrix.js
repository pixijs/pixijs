/**
 * @author Mat Groves http://matgroves.com/ @Doormat23
 */

/**
 * The Matrix class is now an object, which makes it a lot faster, 
 * here is a representation of it : 
 * | a | b | tx|
 * | c | d | ty|
 * | 0 | 0 | 1 |
 *
 * @class Matrix
 * @constructor
 */
PIXI.Matrix = function()
{
    this.a = 1;
    this.b = 0;
    this.c = 0;
    this.d = 1;
    this.tx = 0;
    this.ty = 0;
};

/**
 * Creates a pixi matrix object based on the array given as a parameter
 *
 * @method fromArray
 * @param array {Array} The array that the matrix will be filled with
 */
PIXI.Matrix.prototype.fromArray = function(array)
{
    this.a = array[0];
    this.b = array[1];
    this.c = array[3];
    this.d = array[4];
    this.tx = array[2];
    this.ty = array[5];
};

/**
 * Creates an array from the current Matrix object
 *
 * @method toArray
 * @param transpose {Boolean} Whether we need to transpose the matrix or not
 * @return {Array} the newly created array which contains the matrix
 */
PIXI.Matrix.prototype.toArray = function(transpose)
{
    if(!this.array) this.array = new Float32Array(9);
    var array = this.array;

    if(transpose)
    {
        array[0] = this.a;
        array[1] = this.c;
        array[2] = 0;
        array[3] = this.b;
        array[4] = this.d;
        array[5] = 0;
        array[6] = this.tx;
        array[7] = this.ty;
        array[8] = 1;
    }
    else
    {
        array[0] = this.a;
        array[1] = this.b;
        array[2] = this.tx;
        array[3] = this.c;
        array[4] = this.d;
        array[5] = this.ty;
        array[6] = 0;
        array[7] = 0;
        array[8] = 1;
    }

    return array;
};

PIXI.Matrix.prototype.toGlobal = function(pos)
{
    return {
        x:this.a * pos.x + this.b * pos.y + this.tx,
        y:this.c * pos.x + this.d * pos.y + this.ty
    };
};

PIXI.Matrix.prototype.applyInverse = function(pos)
{
    var id = 1 / (this.a * this.d + this.b * -this.c);
    return {
        x:this.d * id * pos.x + -this.b * id * pos.y + (this.ty * this.b - this.tx * this.d) * id,
        y:this.a * id * pos.y + -this.c * id * pos.x + (-this.ty * this.a + this.tx * this.c) * id
    };
};

PIXI.identityMatrix = new PIXI.Matrix();

PIXI.determineMatrixArrayType = function() {
    return (typeof Float32Array !== 'undefined') ? Float32Array : Array;
};

/**
 * The Matrix2 class will choose the best type of array to use between
 * a regular javascript Array and a Float32Array if the latter is available
 *
 * @class Matrix2
 * @constructor
 */
PIXI.Matrix2 = PIXI.determineMatrixArrayType();
