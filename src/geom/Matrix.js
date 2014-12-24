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
    /**
     * @property a
     * @type Number
     * @default 1
     */
    this.a = 1;

    /**
     * @property b
     * @type Number
     * @default 0
     */
    this.b = 0;

    /**
     * @property c
     * @type Number
     * @default 0
     */
    this.c = 0;

    /**
     * @property d
     * @type Number
     * @default 1
     */
    this.d = 1;

    /**
     * @property tx
     * @type Number
     * @default 0
     */
    this.tx = 0;

    /**
     * @property ty
     * @type Number
     * @default 0
     */
    this.ty = 0;
};

/**
 * Creates a Matrix object based on the given array. The Element to Matrix mapping order is as follows:
 *
 * a = array[0]
 * b = array[1]
 * c = array[3]
 * d = array[4]
 * tx = array[2]
 * ty = array[5]
 *
 * @method fromArray
 * @param array {Array} The array that the matrix will be populated from.
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
 * Creates an array from the current Matrix object.
 *
 * @method toArray
 * @param transpose {Boolean} Whether we need to transpose the matrix or not
 * @return {Array} the newly created array which contains the matrix
 */
PIXI.Matrix.prototype.toArray = function(transpose)
{
    if(!this.array) this.array = new PIXI.Float32Array(9);
    var array = this.array;

    if(transpose)
    {
        array[0] = this.a;
        array[1] = this.b;
        array[2] = 0;
        array[3] = this.c;
        array[4] = this.d;
        array[5] = 0;
        array[6] = this.tx;
        array[7] = this.ty;
        array[8] = 1;
    }
    else
    {
        array[0] = this.a;
        array[1] = this.c;
        array[2] = this.tx;
        array[3] = this.b;
        array[4] = this.d;
        array[5] = this.ty;
        array[6] = 0;
        array[7] = 0;
        array[8] = 1;
    }

    return array;
};

/**
 * Get a new position with the current transformation applied.
 * Can be used to go from a child's coordinate space to the world coordinate space. (e.g. rendering)
 *
 * @method apply
 * @param pos {Point} The origin
 * @param [newPos] {Point} The point that the new position is assigned to (allowed to be same as input)
 * @return {Point} The new point, transformed through this matrix
 */
PIXI.Matrix.prototype.apply = function(pos, newPos)
{
    newPos = newPos || new PIXI.Point();

    newPos.x = this.a * pos.x + this.c * pos.y + this.tx;
    newPos.y = this.b * pos.x + this.d * pos.y + this.ty;

    return newPos;
};

/**
 * Get a new position with the inverse of the current transformation applied.
 * Can be used to go from the world coordinate space to a child's coordinate space. (e.g. input)
 *
 * @method applyInverse
 * @param pos {Point} The origin
 * @param [newPos] {Point} The point that the new position is assigned to (allowed to be same as input)
 * @return {Point} The new point, inverse-transformed through this matrix
 */
PIXI.Matrix.prototype.applyInverse = function(pos, newPos)
{
    newPos = newPos || new PIXI.Point();

    var id = 1 / (this.a * this.d + this.c * -this.b);
     
    newPos.x = this.d * id * pos.x + -this.c * id * pos.y + (this.ty * this.c - this.tx * this.d) * id;
    newPos.y = this.a * id * pos.y + -this.b * id * pos.x + (-this.ty * this.a + this.tx * this.b) * id;

    return newPos;
};

/**
 * Translates the matrix on the x and y.
 * 
 * @method translate
 * @param {Number} x
 * @param {Number} y
 * @return {Matrix} This matrix. Good for chaining method calls.
 **/
PIXI.Matrix.prototype.translate = function(x, y)
{
    this.tx += x;
    this.ty += y;
    
    return this;
};

/**
 * Applies a scale transformation to the matrix.
 * 
 * @method scale
 * @param {Number} x The amount to scale horizontally
 * @param {Number} y The amount to scale vertically
 * @return {Matrix} This matrix. Good for chaining method calls.
 **/
PIXI.Matrix.prototype.scale = function(x, y)
{
    this.a *= x;
    this.d *= y;
    this.c *= x;
    this.b *= y;
    this.tx *= x;
    this.ty *= y;

    return this;
};


/**
 * Applies a rotation transformation to the matrix.
 * @method rotate
 * @param {Number} angle The angle in radians.
 * @return {Matrix} This matrix. Good for chaining method calls.
 **/
PIXI.Matrix.prototype.rotate = function(angle)
{
    var cos = Math.cos( angle );
    var sin = Math.sin( angle );

    var a1 = this.a;
    var c1 = this.c;
    var tx1 = this.tx;

    this.a = a1 * cos-this.b * sin;
    this.b = a1 * sin+this.b * cos;
    this.c = c1 * cos-this.d * sin;
    this.d = c1 * sin+this.d * cos;
    this.tx = tx1 * cos - this.ty * sin;
    this.ty = tx1 * sin + this.ty * cos;
 
    return this;
};

/**
 * Appends the given Matrix to this Matrix.
 * 
 * @method append
 * @param {Matrix} matrix
 * @return {Matrix} This matrix. Good for chaining method calls.
 */
PIXI.Matrix.prototype.append = function(matrix)
{
    var a1 = this.a;
    var b1 = this.b;
    var c1 = this.c;
    var d1 = this.d;

    this.a  = matrix.a * a1 + matrix.b * c1;
    this.b  = matrix.a * b1 + matrix.b * d1;
    this.c  = matrix.c * a1 + matrix.d * c1;
    this.d  = matrix.c * b1 + matrix.d * d1;

    this.tx = matrix.tx * a1 + matrix.ty * c1 + this.tx;
    this.ty = matrix.tx * b1 + matrix.ty * d1 + this.ty;
    
    return this;
};

/**
 * Resets this Matix to an identity (default) matrix.
 * 
 * @method identity
 * @return {Matrix} This matrix. Good for chaining method calls.
 */
PIXI.Matrix.prototype.identity = function()
{
    this.a = 1;
    this.b = 0;
    this.c = 0;
    this.d = 1;
    this.tx = 0;
    this.ty = 0;

    return this;
};

PIXI.identityMatrix = new PIXI.Matrix();
