/**
 * @author Mat Groves http://matgroves.com/ @Doormat23
 */

/**
 * this is the base class for all objects that are rendered on the screen.
 * @class DisplayObject
 * @constructor
 */
PIXI.DisplayObject = function()
{
	/**
	 * The coordinate of the object relative to the local coordinates of the parent.
	 * @property position
	 * @type Point
	 */
	this.position = new PIXI.Point();
	
	/**
	 * The scale factor of the object.
	 * @property scale
	 * @type Point
	 */
	this.scale = new PIXI.Point(1,1);//{x:1, y:1};
	
	/**
	 * The rotation of the object in radians.
	 * @property rotation
	 * @type Number
	 */
	this.rotation = 0;
	
	/**
	 * The opacity of the object.
	 * @property alpha
	 * @type Number
	 */	
	this.alpha = 1;
	
	/**
	 * The visibility of the object.
	 * @property visible
	 * @type Boolean
	 */	
	this.visible = true;
	this.cacheVisible = false;
	
	/**
	 * [read-only] The display object container that contains this display object.
	 * @property parent
	 * @type DisplayObjectContainer
	 */	
	this.parent = null;
	
	/**
	 * [read-only] The stage the display object is connected to, or undefined if it is not connected to the stage.
	 * @property stage
	 * @type Stage
	 */	
	this.stage = null;
	
	this.worldAlpha = 1;
	this.color = [];
	
	this.worldTransform = PIXI.mat3.create()//mat3.identity();
	this.localTransform = PIXI.mat3.create()//mat3.identity();
	
	this.dynamic = true;
	// chach that puppy!
	this._sr = 0;
	this._cr = 1;
	
	this.renderable = false;
	
	// NOT YET :/ This only applies to children within the container..
	this.interactive = true;
}

// constructor
PIXI.DisplayObject.constructor = PIXI.DisplayObject;

/**
 * @private
 */
PIXI.DisplayObject.prototype.updateTransform = function()
{
	// TODO OPTIMIZE THIS!! with dirty
	if(this.rotation != this.rotationCache)
	{
		this.rotationCache = this.rotation;
		this._sr =  Math.sin(this.rotation);
		this._cr =  Math.cos(this.rotation);
	}	
	
	var localTransform = this.localTransform;
	var parentTransform = this.parent.worldTransform;
	var worldTransform = this.worldTransform;
	//console.log(localTransform)
	localTransform[0] = this._cr * this.scale.x;
	localTransform[1] = -this._sr * this.scale.y
	localTransform[3] = this._sr * this.scale.x;
	localTransform[4] = this._cr * this.scale.y;
	
	///AAARR GETTER SETTTER!
	localTransform[2] = this.position.x;
	localTransform[5] = this.position.y;
	
    // Cache the matrix values (makes for huge speed increases!)
    var a00 = localTransform[0], a01 = localTransform[1], a02 = localTransform[2],
        a10 = localTransform[3], a11 = localTransform[4], a12 = localTransform[5];

        b00 = parentTransform[0], b01 = parentTransform[1], b02 = parentTransform[2],
        b10 = parentTransform[3], b11 = parentTransform[4], b12 = parentTransform[5];

    worldTransform[0] = b00 * a00 + b01 * a10;
    worldTransform[1] = b00 * a01 + b01 * a11;
    worldTransform[2] = b00 * a02 + b01 * a12 + b02;

    worldTransform[3] = b10 * a00 + b11 * a10;
    worldTransform[4] = b10 * a01 + b11 * a11;
    worldTransform[5] = b10 * a02 + b11 * a12 + b12;

	// because we are using affine transformation, we can optimise the matrix concatenation process.. wooo!
	// mat3.multiply(this.localTransform, this.parent.worldTransform, this.worldTransform);
	this.worldAlpha = this.alpha * this.parent.worldAlpha;		
}
