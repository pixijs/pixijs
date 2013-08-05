/**
 * @author Mat Groves http://matgroves.com/ @Doormat23
 */

/**
 * The Point object represents a location in a two-dimensional coordinate system, where x represents the horizontal axis and y represents the vertical axis.
 *
 * @class Point
 * @constructor 
 * @param x {Number} position of the point
 * @param y {Number} position of the point
 */
PIXI.Point = function(x, y)
{
	/**
	 * @property x 
	 * @type Number
	 * @default 0
	 */
	this.x = x || 0;
	
	/**
	 * @property y
	 * @type Number
	 * @default 0
	 */
	this.y = y || 0;
}

/**
 * Creates a clone of this point
 *
 * @method clone
 * @return {Point} a copy of the point
 */
PIXI.Point.prototype.clone = function()
{
	return new PIXI.Point(this.x, this.y);
}




/**
 * The length of the vector
 *
 * @property length
 * @type Number
 */
Object.defineProperty(PIXI.Point.prototype, 'length', {
    get: function() {
        return Math.sqrt(this.lengthSQ());
    },
    set: function(value) {
		var a = this.angle;
		this.x = Math.cos(a) * value;
		this.y = Math.sin(a) * value;
    }
});

/**
 * The angle of the vector
 *
 * @property angle
 * @type Number
 */
Object.defineProperty(PIXI.Point.prototype, 'angle', {
    get: function() {
    	return Math.atan2(this.y, this.x);
    },
    set: function(value) {
        length = this.length;
        this.x = Math.cos(value) * length;
        this.y = Math.sin(value) * length;
    }
});


/**
 * Normalize the point
 *
 * @method normalize
 * @return {Point} itself
 */
PIXI.Point.prototype.normalize = function() {
	var len;
	if (this.length === 0) {
		this.x = 1;
	}
	len = this.length;
	this.x /= len;
	this.y /= len;

	return this;
}
/**
 * Truncate the vector to a maximum value
 *
 * @property max
 * @type Number
 *
 * @return {Point} itself
 */
PIXI.Point.prototype.truncate = function(max) {
	this.length = Math.min(max, this.length);

	return this;
}
/**
 * Returns whenever the point is a zero vector or not
 *
 * @method zero
 * @return {Boolean}
 *
 * @return {Point} itself
 */
PIXI.Point.prototype.zero = function() {
	this.x = this.y = 0;

	return this;
}
/**
 * Reverse the point
 *
 * @method reverse
 *
 * @return {Point} itself
 */
PIXI.Point.prototype.reverse = function() {
	this.x = -this.x;
	this.y = -this.y;

	return this;
}




/**
 * Returns the dot product of the vector to another one
 *
 * @property p
 * @type Point
 *
 * @return {Number} the dot product Value
 */
PIXI.Point.prototype.dotProd = function(p) {
	return this.x * p.x + this.y * p.y;
}


/**
 * Add a Point p
 *
 * @property p
 * @type Point
 *
 * @return {Point} itself
 */
PIXI.Point.prototype.add = function(p) {
	this.x += p.x; 
	this.y += p.y;

	return this;
}

/**
 * Substract a Point p
 *
 * @property p
 * @type Point
 *
 * @return {Point} itself
 */
PIXI.Point.prototype.subtract = function(p) {
	this.x -= p.x;
	this.y -= p.y;

	return this;
}

/**
 * Multiply the Point by val
 *
 * @property val
 * @type Number
 *
 * @return {Point} itself
 */
PIXI.Point.prototype.multiply = function(val) {
	this.x *= val;
	this.y *= val;

	return this;
}

/**
 * Divide the Point by val
 *
 * @property val
 * @type Number
 *
 * @return {Point} itself
 */
PIXI.Point.prototype.divide = function(val) {
	this.x /= val; 
	this.y /= val;

	return this;
}

/**
 * Get a new Point perpendicular to the point
 *
 * @method perp
 * @return {Point}
 */
PIXI.Point.prototype.perp = function() {
	return new PIXI.Point(-this.y, this.x);
}


/**
 * Compare the point to another one
 *
 * @property p
 * @type Point
 *
 * @return {Boolean}
 */
PIXI.Point.prototype.equals = function(p) {
  return this.x === p.x && this.y === p.y;
}

/**
 * Tells whenever the point is zero or not
 *
 * @return {Boolean}
 */
PIXI.Point.prototype.isZero = function() {
	return this.x === 0 && this.y === 0;
}

/**
 * Tells whenever the point is normalized or not
 *
 * @return {Boolean}
 */
PIXI.Point.prototype.isNormalized = function() {
	return this.length === 1;
}


/**
 * returns the distance of the point from another one
 *
 * @property p
 * @type Point
 *
 * @return {Number}
 */
PIXI.Point.prototype.dist = function(p) {
	return Math.sqrt(this.distSQ(p));
}
PIXI.Point.prototype.distSQ = function(p) {
  var dx, dy;
  dx = p.x - this.x;
  dy = p.y - this.y;
  return dx * dx + dy * dy;
}
PIXI.Point.prototype.lengthSQ = function() {
	return this.x * this.x + this.y * this.y;
}


// constructor
PIXI.Point.prototype.constructor = PIXI.Point;

