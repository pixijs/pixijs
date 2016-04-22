// @todo - ignore the too many parameters warning for now
// should either fix it or change the jshint config
// jshint -W072

var Point = require('./Point'),
    mat4 = require('../../../node_modules/gl-matrix/src/gl-matrix/mat4');

/**
 * The pixi Matrix class as an object, which makes it a lot faster,
 * here is a representation of it :
 * | a | b | tx|
 * | c | d | ty|
 * | 0 | 0 | 1 |
 *
 * Underlying matrix is mat4 to make experiments with 2.5d easier.
 *
 * @class
 * @memberof PIXI
 */
function Matrix()
{
    /**
     * Internal glMat
     * @type {mat4}
     * @private
     */
    this._mat4 = mat4.create();

    /**
     * Can we use 2d optimization?
     * @member {boolean}
     * @default true;
     */
    this.is2d = true;

    /**
     * Did someone change it?
     * @type {number}
     */
    this.version = 0;
}

Matrix.prototype.constructor = Matrix;
module.exports = Matrix;

Object.defineProperties(Matrix.prototype, {
    /**
     * @member {number}
     * @memberof PIXI.Matrix
     * @default 1
     */
    a: {
        get: function() {
            return this._mat4[0];
        },
        set: function(value) {
            this._mat4[0] = value;
        }
    },
    /**
     * @member {number}
     * @memberof PIXI.Matrix
     * @default 0
     */
    b: {
        get: function() {
            return this._mat4[1];
        },
        set: function(value) {
            this._mat4[1] = value;
        }
    },
    /**
     * @member {number}
     * @memberof PIXI.Matrix
     * @default 0
     */
    c: {
        get: function() {
            return this._mat4[4];
        },
        set: function(value) {
            this._mat4[4] = value;
        }
    },
    /**
     * @member {number}
     * @memberof PIXI.Matrix
     * @default 1
     */
    d: {
        get: function() {
            return this._mat4[5];
        },
        set: function(value) {
            this._mat4[5] = value;
        }
    },
    /**
     * @member {number}
     * @memberof PIXI.Matrix
     * @default 0
     */
    tx: {
        get: function() {
            return this._mat4[12];
        },
        set: function(value) {
            this._mat4[12] = value;
        }
    },
    /**
     * @member {number}
     * @memberof PIXI.Matrix
     * @default 0
     */
    ty: {
        get: function() {
            return this._mat4[13];
        },
        set: function(value) {
            this._mat4[13] = value;
        }
    }
});

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
 * @param array {number[]} The array that the matrix will be populated from.
 */
Matrix.prototype.fromArray = function (array)
{
    this.a = array[0];
    this.b = array[1];
    this.c = array[3];
    this.d = array[4];
    this.tx = array[2];
    this.ty = array[5];
};


/**
 * sets the matrix properties
 *
 * @param {number} a
 * @param {number} b
 * @param {number} c
 * @param {number} d
 * @param {number} tx
 * @param {number} ty
 *
 * @return {PIXI.Matrix} This matrix. Good for chaining method calls.
 */
Matrix.prototype.set = function (a, b, c, d, tx, ty)
{
    this.a = a;
    this.b = b;
    this.c = c;
    this.d = d;
    this.tx = tx;
    this.ty = ty;

    return this;
};


/**
 * Creates an array from the current Matrix object.
 *
 * @param transpose {boolean} Whether we need to transpose the matrix or not
 * @param [out=Float32Array[]} If provided the array will be assigned to out
 * @return {number[]} the newly created array which contains the matrix
 */
Matrix.prototype.toArray = function (transpose, out)
{
    if (!this.array)
    {
        this.array = new Float32Array(9);
    }

    var array = out || this.array;
    var m = this._mat4;

    if (transpose)
    {
        array[0] = m[0];
        array[1] = m[4];
        array[2] = 0;
        array[3] = m[1];
        array[4] = m[5];
        array[5] = 0;
        array[6] = m[12];
        array[7] = m[13];
        array[8] = 1;
    }
    else
    {
        array[0] = m[0];
        array[1] = m[1];
        array[2] = m[12];
        array[3] = m[4];
        array[4] = m[5];
        array[5] = m[13];
        array[6] = 0;
        array[7] = 0;
        array[8] = 1;
    }

    return array;
};

/**
 * Exposes underlying mat4
 * @return {Float32Array}
 */
Matrix.prototype.toMat4 = function () {
    return this._mat4;
};

/**
 * Get a new position with the current transformation applied.
 * Can be used to go from a child's coordinate space to the world coordinate space. (e.g. rendering)
 *
 * @param pos {PIXI.Point} The origin
 * @param [newPos] {PIXI.Point} The point that the new position is assigned to (allowed to be same as input)
 * @return {PIXI.Point} The new point, transformed through this matrix
 */
Matrix.prototype.apply = function (pos, newPos)
{
    newPos = newPos || new Point();

    var x = pos.x;
    var y = pos.y;

    newPos.x = this.a * x + this.c * y + this.tx;
    newPos.y = this.b * x + this.d * y + this.ty;

    return newPos;
};

/**
 * Get a new position with the inverse of the current transformation applied.
 * Can be used to go from the world coordinate space to a child's coordinate space. (e.g. input)
 *
 * @param pos {PIXI.Point} The origin
 * @param [newPos] {PIXI.Point} The point that the new position is assigned to (allowed to be same as input)
 * @return {PIXI.Point} The new point, inverse-transformed through this matrix
 */
Matrix.prototype.applyInverse = function (pos, newPos)
{
    newPos = newPos || new Point();

    var id = 1 / (this.a * this.d + this.c * -this.b);

    var x = pos.x;
    var y = pos.y;

    newPos.x = this.d * id * x + -this.c * id * y + (this.ty * this.c - this.tx * this.d) * id;
    newPos.y = this.a * id * y + -this.b * id * x + (-this.ty * this.a + this.tx * this.b) * id;

    return newPos;
};

/**
 * Translates the matrix on the x and y.
 *
 * @param {number} x
 * @param {number} y
 * @return {PIXI.Matrix} This matrix. Good for chaining method calls.
 */
Matrix.prototype.translate = function (x, y)
{
    this.tx += x;
    this.ty += y;

    return this;
};

/**
 * Applies a scale transformation to the matrix.
 *
 * @param {number} x The amount to scale horizontally
 * @param {number} y The amount to scale vertically
 * @return {PIXI.Matrix} This matrix. Good for chaining method calls.
 */
Matrix.prototype.scale = function (x, y)
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
 *
 * @param {number} angle - The angle in radians.
 * @return {PIXI.Matrix} This matrix. Good for chaining method calls.
 */
Matrix.prototype.rotate = function (angle)
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
 * @param {PIXI.Matrix} matrix
 * @return {PIXI.Matrix} This matrix. Good for chaining method calls.
 */
Matrix.prototype.append = function (matrix)
{
    var m = this._mat4;
    var m2 = matrix._mat4;
    var a = m[0], b = m[1], c = m[4], d = m[5];
    if (m2[0] !== 1 || m2[4] !== 0 || m2[1] !== 0 || m2[5] !== 1) {
        m[0] = m2[0] * a + m2[4] * c;
        m[1] = m2[0] * b + m2[4] * d;
        m[4] = m2[1] * a + m2[5] * c;
        m[5] = m2[1] * b + m2[5] * d;
    }
    m[12] = m2[12] * a + m2[13] * c + m[12];
    m[13] = m2[12] * b + m2[13] * d + m[13];

    return this;
};

/**
 * Appends second Matrix to first Matrix and saves in this Matrix.
 *
 * @param {PIXI.Matrix} matrix
 * @return {PIXI.Matrix} This matrix. Good for chaining method calls.
 */
Matrix.prototype.copyAppend = function (matrix1, matrix2)
{
    var m = this._mat4;
    var m1 = matrix1._mat4;
    var m2 = matrix2._mat4;
    m[0] = m2[0] * m1[0] + m2[4] * m1[4];
    m[1] = m2[0] * m1[1] + m2[4] * m1[5];
    m[4] = m2[1] * m1[0] + m2[5] * m1[4];
    m[5] = m2[1] * m1[1] + m2[5] * m1[5];
    m[12] = m2[12] * m1[0] + m2[13] * m1[2] + m1[12];
    m[13] = m2[12] * m1[1] + m2[13] * m1[3] + m1[13];
    if (!this.is2d) {
        m[2] = 0;
        m[3] = 0;
        m[6] = 0;
        m[7] = 0;
        m[8] = 0;
        m[9] = 0;
        m[10] = 1;
        m[11] = 0;
        m[14] = 0;
        m[15] = 1;
        this.is2d = true;
    }
    return this;
};

/**
 * Sets the 2d matrix based on all the available properties
 *
 * @param {number} x
 * @param {number} y
 * @param {number} pivotX
 * @param {number} pivotY
 * @param {number} scaleX
 * @param {number} scaleY
 * @param {number} cr cos(rotation)
 * @param {number} sr sin(rotation)
 * @param {number} cx cos(skewX)
 * @param {number} nsx -sin(skewX)
 * @param {number} cy cos(skewY)
 * @param {number} sy sin(skewY)
 *
 * @return {PIXI.Matrix} This matrix. Good for chaining method calls.
 */
Matrix.prototype.setTransform = function (x, y, pivotX, pivotY, scaleX, scaleY, cr, sr, cx, nsx, cy, sy)
{
    this.is2d = true;
    var a, b, c, d;
    a  =  cr * scaleX;
    b  =  sr * scaleX;
    c  = -sr * scaleY;
    d  =  cr * scaleY;

    var m = this._mat4;
    m[0]  = cy * a + sy * c;
    m[1]  = cy * b + sy * d;
    m[4]  = nsx * a + cx * c;
    m[5]  = nsx * b + cx * d;
    m[12] = x - ( pivotX * m[0] + pivotY * m[4] );
    m[13] = y - ( pivotX * m[1] + pivotY * m[5] );
    if (!this.is2d) {
        m[2] = 0;
        m[3] = 0;
        m[6] = 0;
        m[7] = 0;
        m[8] = 0;
        m[9] = 0;
        m[10] = 1;
        m[11] = 0;
        m[14] = 0;
        m[15] = 1;
        this.is2d = true;
    }
    return this;
};

/**
 * Prepends the given Matrix to this Matrix.
 *
 * @param {PIXI.Matrix} matrix
 * @return {PIXI.Matrix} This matrix. Good for chaining method calls.
 */
Matrix.prototype.prepend = function(matrix)
{
    var m = this._mat4;
    var m2 = matrix._mat4;

    var tx1 = m[12];
    var a1 = m[0];
    var c1 = m[4];
    m[0] = a1 * m2[0] + m[1] * m2[1];
    m[1] = a1 * m2[4] + m[1] * m2[5];
    m[4] = c1 * m2[0] + m[5] * m2[1];
    m[5] = c1 * m2[4] + m[5] * m2[5];
    m[12] = tx1 * m2[0] + m[13] * m2[1] + m2[12];
    m[13] = tx1 * m2[4] + m[13] * m2[5] + m2[13];
    return this;
};

/**
 * Inverts this matrix
 *
 * @return {PIXI.Matrix} This matrix. Good for chaining method calls.
 */
Matrix.prototype.invert = function()
{
    var m  = this._mat4;
    var a1 = m[0];
    var b1 = m[1];
    var c1 = m[4];
    var d1 = m[5];
    var tx1 = m[12];
    var n = a1*d1-b1*c1;
    m[0] = d1/n;
    m[1] = -b1/n;
    m[4] = -c1/n;
    m[5] = a1/n;
    m[12] = (c1*m[12]-d1*tx1)/n;
    m[13] = -(a1*m[13]-b1*tx1)/n;
    return this;
};


/**
 * Resets this Matix to an identity (default) matrix.
 *
 * @return {PIXI.Matrix} This matrix. Good for chaining method calls.
 */
Matrix.prototype.identity = function ()
{
    mat4.identity(this._mat4);
    return this;
};

/**
 * Creates a new Matrix object with the same values as this one.
 *
 * @return {PIXI.Matrix} A copy of this matrix. Good for chaining method calls.
 */
Matrix.prototype.clone = function ()
{
    return new Matrix().copy(this);
};

/**
 * Changes the values of this matrix to be the same as the ones in the given matrix
 *
 * @return {PIXI.Matrix} The matrix given in parameter
 */
Matrix.prototype.copyFrom = function (matrix)
{
    mat4.copy(this._mat4, matrix._mat4);
    this.is2d = matrix.is2d;
    return this;
};

Matrix.prototype.copy = function (matrix)
{
    mat4.copy(this._mat4, matrix._mat4);
    this.is2d = matrix.is2d;
    return this;
};

/**
 * Changes the values of the given matrix to be the same as the ones in this matrix
 *
 * @return {PIXI.Matrix} The matrix given in parameter
 */
Matrix.prototype.copyTo = function (matrix)
{
    mat4.copy(matrix._mat4, this._mat4);
    matrix.is2d = this.is2d;
    return matrix;
};

/**
 * A default (identity) matrix
 *
 * @static
 * @const
 */
Matrix.IDENTITY = new Matrix();

/**
 * A temp matrix
 *
 * @static
 * @const
 */
Matrix.TEMP_MATRIX = new Matrix();
