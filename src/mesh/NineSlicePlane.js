var DEFAULT_BORDER_SIZE= 10;

var Plane = require('./Plane');

/**
 * The NineSlicePlane allows you to stretch a texture using 9-slice scaling. The corners will remain unscaled (useful
 * for buttons with rounded corners for example) and the other areas will be scaled horizontally and or vertically
 *  
 *```js
 * var Plane9 = new PIXI.NineSlicePlane(PIXI.Texture.fromImage("BoxWithRoundedCorners.png"), 15, 15, 15, 15);
 *  ```
 * <pre>
 *      A                          B
 *    +---+----------------------+---+
 *  C | 1 |          2           | 3 |
 *    +---+----------------------+---+
 *    |   |                      |   |
 *    | 4 |          5           | 6 |
 *    |   |                      |   |
 *    +---+----------------------+---+
 *  D | 7 |          8           | 9 |
 *    +---+----------------------+---+

 *  When changing this objects width and/or height:
 *     areas 1 3 7 and 9 will remain unscaled.
 *     areas 2 and 8 will be stretched horizontally
 *     areas 4 and 6 will be stretched vertically
 *     area 5 will be stretched both horizontally and vertically
 * </pre>
 *
 * @class
 * @extends PIXI.mesh.Plane
 * @memberof PIXI.mesh
 * @param {PIXI.Texture} texture - The texture to use on the NineSlicePlane.
 * @param {int} [leftWidth=10] size of the left vertical bar (A)
 * @param {int} [topHeight=10] size of the top horizontal bar (C)
 * @param {int} [rightWidth=10] size of the right vertical bar (B)
 * @param {int} [bottomHeight=10] size of the bottom horizontal bar (D)
 *
 */
function NineSlicePlane(texture, leftWidth, topHeight, rightWidth, bottomHeight)
{
	Plane.call(this, texture, 4, 4);

	var uvs = this.uvs;
	// right and bottom uv's are always 1
	uvs[6] = uvs[14] = uvs[22] = uvs[30] = 1;
	uvs[25] = uvs[27] = uvs[29] = uvs[31] = 1;

	this._origWidth = texture.width;
	this._origHeight = texture.height;
	/**
	 * The width of the NineSlicePlane, setting this will actually modify the vertices and UV's of this plane
	 *
	 * @member {number}
	 * @memberof PIXI.NineSlicePlane#
	 * @override
	 */
	this.width = texture.width;
	/**
	 * The height of the NineSlicePlane, setting this will actually modify the vertices and UV's of this plane
	 *
	 * @member {number}
	 * @memberof PIXI.NineSlicePlane#
	 * @override
	 */
	this.height = texture.height;

	uvs[2] = uvs[10] = uvs[18] = uvs[26] = this._uvw * leftWidth;
	uvs[4] = uvs[12] = uvs[20] = uvs[28] = 1 - this._uvw * rightWidth;
	uvs[9] = uvs[11] = uvs[13] = uvs[15] = this._uvh * topHeight;
	uvs[17] = uvs[19] = uvs[21] = uvs[23] = 1 - this._uvh * bottomHeight;

	/**
	 * The width of the left column (a)
	 *
	 * @member {number}
	 */
	this.leftWidth = leftWidth || DEFAULT_BORDER_SIZE;
	/**
	 * The width of the right column (b)
	 *
	 * @member {number}
	 */
	this.rightWidth = rightWidth || DEFAULT_BORDER_SIZE;
	/**
	 * The height of the top row (c)
	 *
	 * @member {number}
	 */
	this.topHeight = topHeight || DEFAULT_BORDER_SIZE;
	/**
	 * The height of the bottom row (d)
	 *
	 * @member {number}
	 */
	this.bottomHeight = bottomHeight || DEFAULT_BORDER_SIZE;
}


// constructor
NineSlicePlane.prototype = Object.create( Plane.prototype );
NineSlicePlane.prototype.constructor = NineSlicePlane;
module.exports = NineSlicePlane;

Object.defineProperties(NineSlicePlane.prototype, {
	/**
	 * The width of the NineSlicePlane, setting this will actually modify the vertices and UV's of this plane
	 *
	 * @member {number}
	 * @memberof PIXI.NineSlicePlane#
	 * @override
	 */
	width: {
		get: function ()
		{
			return this._width;
		},
		set: function (value)
		{
			this._width = value;
			this._uvw = 1 / value * value / this._origWidth;
			this.updateVerticalVertices();
		}
	},

	/**
	 * The height of the NineSlicePlane, setting this will actually modify the vertices and UV's of this plane
	 *
	 * @member {number}
	 * @memberof PIXI.NineSlicePlane#
	 * @override
	 */
	height: {
		get: function ()
		{
			return  this._height;
		},
		set: function (value)
		{
			this._height = value;
			this._uvh = 1 / value * value / this._origHeight;
			this.updateHorizontalVertices();
		}
	},

	/**
	 * The width of the left column
	 *
	 * @member {number}
	 */
	leftWidth: {
		get: function()
		{
			return this._leftWidth;
		},
		set: function (value)
		{
			this._leftWidth = value;
			var uvs = this.uvs;
			var vertices = this.vertices;
			uvs[2] = uvs[10] = uvs[18] = uvs[26] = this._uvw * value;
			vertices[2] = vertices[10] = vertices[18] = vertices[26] = value;
			this.dirty=true;
		}
	},
	/**
	 * The width of the right column
	 *
	 * @member {number}
	 */
	rightWidth: {
		get: function()
		{
			return this._rightWidth;
		},
		set: function (value)
		{
			this._rightWidth = value;
			var uvs = this.uvs;
			var vertices = this.vertices;
			uvs[4] = uvs[12] = uvs[20] = uvs[28] = 1 - this._uvw * value;
			vertices[4] = vertices[12] = vertices[20] = vertices[28] = this._width - value;
			this.dirty=true;
		}
	},
	/**
	 * The height of the top row
	 *
	 * @member {number}
	 */
	topHeight: {
		get: function()
		{
			return this._topHeight;
		},
		set: function (value)
		{
			this._topHeight = value;
			var uvs = this.uvs;
			var vertices = this.vertices;
			uvs[9] = uvs[11] = uvs[13] = uvs[15] = this._uvh * value;
			vertices[9] = vertices[11] = vertices[13] = vertices[15] = value;
			this.dirty=true;
		}
	},
	/**
	 * The height of the bottom row
	 *
	 * @member {number}
	 */
	bottomHeight: {
		get: function()
		{
			return this._bottomHeight;
		},
		set: function (value)
		{
			this._bottomHeight = value;
			var uvs = this.uvs;
			var vertices = this.vertices;
			uvs[17] = uvs[19] = uvs[21] = uvs[23] = 1 - this._uvh * value;
			vertices[17] = vertices[19] = vertices[21] = vertices[23] = this._height - value;
			this.dirty=true;
		}
	}
});

NineSlicePlane.prototype.updateHorizontalVertices = function() {
	var vertices = this.vertices;
	vertices[9] = vertices[11] = vertices[13] = vertices[15] = this._topHeight;
	vertices[17] = vertices[19] = vertices[21] = vertices[23] = this._height - this._bottomHeight;
	vertices[25] = vertices[27] = vertices[29] = vertices[31] = this._height;
};

NineSlicePlane.prototype.updateVerticalVertices = function() {
	var vertices = this.vertices;
	vertices[2] = vertices[10] = vertices[18] = vertices[26] = this._leftWidth;
	vertices[4] = vertices[12] = vertices[20] = vertices[28] = this._width - this._rightWidth;
	vertices[6] = vertices[14] = vertices[22] = vertices[30] = this._width ;
};
