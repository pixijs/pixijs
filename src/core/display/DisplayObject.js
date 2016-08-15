var EventEmitter = require('eventemitter3'),
    CONST = require('../const'),
    TransformStatic = require('./TransformStatic'),
    Transform = require('./Transform'),
    Bounds = require('./Bounds'),
    math = require('../math'),
    _tempDisplayObjectParent = new DisplayObject();

/**
 * The base class for all objects that are rendered on the screen.
 * This is an abstract class and should not be used on its own rather it should be extended.
 *
 * @class
 * @extends EventEmitter
 * @mixes PIXI.interaction.interactiveTarget
 * @memberof PIXI
 */
function DisplayObject()
{
    EventEmitter.call(this);

    var TransformClass = CONST.TRANSFORM_MODE.DEFAULT === CONST.TRANSFORM_MODE.STATIC ? TransformStatic : Transform;

    //TODO: need to create Transform from factory
    /**
     * World transform and local transform of this object.
     * This will be reworked in v4.1, please do not use it yet unless you know what are you doing!
     *
     * @member {PIXI.TransformBase}
     */
    this.transform =  new TransformClass();

    /**
     * The opacity of the object.
     *
     * @member {number}
     */
    this.alpha = 1;

    /**
     * The visibility of the object. If false the object will not be drawn, and
     * the updateTransform function will not be called.
     *
     * @member {boolean}
     */
    this.visible = true;

    /**
     * Can this object be rendered, if false the object will not be drawn but the updateTransform
     * methods will still be called.
     *
     * @member {boolean}
     */
    this.renderable = true;

    /**
     * The display object container that contains this display object.
     *
     * @member {PIXI.Container}
     * @readonly
     */
    this.parent = null;

    /**
     * The multiplied alpha of the displayObject
     *
     * @member {number}
     * @readonly
     */
    this.worldAlpha = 1;

    /**
     * The area the filter is applied to. This is used as more of an optimisation
     * rather than figuring out the dimensions of the displayObject each frame you can set this rectangle
     *
     * Also works as an interaction mask
     *
     * @member {PIXI.Rectangle}
     */
    this.filterArea = null;

    this._filters = null;
    this._enabledFilters = null;

    /**
     * The bounds object, this is used to calculate and store the bounds of the displayObject
     *
     * @member {PIXI.Rectangle}
     * @private
     */
    this._bounds = new Bounds();
    this._boundsID = 0;
    this._lastBoundsID = -1;
    this._boundsRect = null;
    this._localBoundsRect = null;

    /**
     * The original, cached mask of the object
     *
     * @member {PIXI.Rectangle}
     * @private
     */
    this._mask = null;


}

// constructor
DisplayObject.prototype = Object.create(EventEmitter.prototype);
DisplayObject.prototype.constructor = DisplayObject;
module.exports = DisplayObject;


Object.defineProperties(DisplayObject.prototype, {
    /**
     * The position of the displayObject on the x axis relative to the local coordinates of the parent.
     * An alias to position.x
     *
     * @member {number}
     * @memberof PIXI.DisplayObject#
     */
    x: {
        get: function ()
        {
            return this.position.x;
        },
        set: function (value)
        {
            this.transform.position.x = value;
        }
    },

    /**
     * The position of the displayObject on the y axis relative to the local coordinates of the parent.
     * An alias to position.y
     *
     * @member {number}
     * @memberof PIXI.DisplayObject#
     */
    y: {
        get: function ()
        {
            return this.position.y;
        },
        set: function (value)
        {
            this.transform.position.y = value;
        }
    },

    /**
     * Current transform of the object based on world (parent) factors
     *
     * @member {PIXI.Matrix}
     * @memberof PIXI.DisplayObject#
     * @readonly
     */
    worldTransform: {
        get: function ()
        {
            return this.transform.worldTransform;
        }
    },

    /**
     * Current transform of the object based on local factors: position, scale, other stuff
     *
     * @member {PIXI.Matrix}
     * @memberof PIXI.DisplayObject#
     * @readonly
     */
    localTransform: {
        get: function ()
        {
            return this.transform.localTransform;
        }
    },

    /**
     * The coordinate of the object relative to the local coordinates of the parent.
     * Assignment by value since pixi-v4.
     *
     * @member {PIXI.Point|PIXI.ObservablePoint}
     * @memberof PIXI.DisplayObject#
     */
    position: {
        get: function()
        {
            return this.transform.position;
        },
        set: function(value) {
            this.transform.position.copy(value);
        }
    },

    /**
     * The scale factor of the object.
     * Assignment by value since pixi-v4.
     *
     * @member {PIXI.Point|PIXI.ObservablePoint}
     * @memberof PIXI.DisplayObject#
     */
    scale: {
        get: function() {
            return this.transform.scale;
        },
        set: function(value) {
            this.transform.scale.copy(value);
        }
    },

    /**
     * The pivot point of the displayObject that it rotates around
     * Assignment by value since pixi-v4.
     *
     * @member {PIXI.Point|PIXI.ObservablePoint}
     * @memberof PIXI.DisplayObject#
     */
    pivot: {
        get: function() {
            return this.transform.pivot;
        },
        set: function(value) {
            this.transform.pivot.copy(value);
        }
    },

    /**
     * The skew factor for the object in radians.
     * Assignment by value since pixi-v4.
     *
     * @member {PIXI.ObservablePoint}
     * @memberof PIXI.DisplayObject#
     */
    skew: {
        get: function() {
            return this.transform.skew;
        },
        set: function(value) {
            this.transform.skew.copy(value);
        }
    },

    /**
     * The rotation of the object in radians.
     *
     * @member {number}
     * @memberof PIXI.DisplayObject#
     */
    rotation: {
        get: function ()
        {
            return this.transform.rotation;
        },
        set: function (value)
        {
            this.transform.rotation = value;
        }
    },

    /**
     * Indicates if the sprite is globally visible.
     *
     * @member {boolean}
     * @memberof PIXI.DisplayObject#
     * @readonly
     */
    worldVisible: {
        get: function ()
        {
            var item = this;

            do {
                if (!item.visible)
                {
                    return false;
                }

                item = item.parent;
            } while (item);

            return true;
        }
    },

    /**
     * Sets a mask for the displayObject. A mask is an object that limits the visibility of an object to the shape of the mask applied to it.
     * In PIXI a regular mask must be a PIXI.Graphics or a PIXI.Sprite object. This allows for much faster masking in canvas as it utilises shape clipping.
     * To remove a mask, set this property to null.
     *
     * @todo For the moment, PIXI.CanvasRenderer doesn't support PIXI.Sprite as mask.
     *
     * @member {PIXI.Graphics|PIXI.Sprite}
     * @memberof PIXI.DisplayObject#
     */
    mask: {
        get: function ()
        {
            return this._mask;
        },
        set: function (value)
        {
            if (this._mask)
            {
                this._mask.renderable = true;
            }

            this._mask = value;

            if (this._mask)
            {
                this._mask.renderable = false;
            }
        }
    },

    /**
     * Sets the filters for the displayObject.
     * * IMPORTANT: This is a webGL only feature and will be ignored by the canvas renderer.
     * To remove filters simply set this property to 'null'
     *
     * @member {PIXI.AbstractFilter[]}
     * @memberof PIXI.DisplayObject#
     */
    filters: {
        get: function ()
        {
            return this._filters && this._filters.slice();
        },
        set: function (value)
        {
            this._filters = value && value.slice();
        }
    }

});

/*
 * Updates the object transform for rendering
 *
 * TODO - Optimization pass!
 */
DisplayObject.prototype.updateTransform = function ()
{
    this.transform.updateTransform(this.parent.transform);
    // multiply the alphas..
    this.worldAlpha = this.alpha * this.parent.worldAlpha;

    this._bounds.updateID++;
};

// performance increase to avoid using call.. (10x faster)
DisplayObject.prototype.displayObjectUpdateTransform = DisplayObject.prototype.updateTransform;

/**
 * recursively updates transform of all objects from the root to this one
 * internal function for toLocal()
 */
DisplayObject.prototype._recursivePostUpdateTransform = function()
{
    if (this.parent)
    {
        this.parent._recursivePostUpdateTransform();
        this.transform.updateTransform(this.parent.transform);
    }
    else
    {
        this.transform.updateTransform(_tempDisplayObjectParent.transform);
    }
};

/**
 *
 *
 * Retrieves the bounds of the displayObject as a rectangle object.
 * @param skipUpdate {boolean} setting to true will stop the transforms of the scene graph from being updated. This means the calculation returned MAY be out of date BUT will give you a nice performance boost
 * @param rect {PIXI.Rectangle} Optional rectangle to store the result of the bounds calculation
 * @return {PIXI.Rectangle} the rectangular bounding area
 */
DisplayObject.prototype.getBounds = function (skipUpdate, rect)
{
    if(!skipUpdate)
    {
        if(!this.parent)
        {
            this.parent = _tempDisplayObjectParent;
            this.parent.transform._worldID++;
            this.updateTransform();
            this.parent = null;
        }
        else
        {
            this._recursivePostUpdateTransform();
            this.updateTransform();
        }
    }

    if(this._boundsID !== this._lastBoundsID)
    {
        this.calculateBounds();
    }

    if(!rect)
    {
        if(!this._boundsRect)
        {
            this._boundsRect = new math.Rectangle();
        }

        rect = this._boundsRect;
    }

    return this._bounds.getRectangle(rect);
};

/**
 * Retrieves the local bounds of the displayObject as a rectangle object
 * @param rect {PIXI.Rectangle} Optional rectangle to store the result of the bounds calculation
 * @return {PIXI.Rectangle} the rectangular bounding area
 */
DisplayObject.prototype.getLocalBounds = function (rect)
{
    var transformRef = this.transform;
    var parentRef = this.parent;

    this.parent = null;
    this.transform = _tempDisplayObjectParent.transform;

    if(!rect)
    {
        if(!this._localBoundsRect)
        {
            this._localBoundsRect = new math.Rectangle();
        }

        rect = this._localBoundsRect;
    }

    var bounds = this.getBounds(false, rect);

    this.parent = parentRef;
    this.transform = transformRef;

    return bounds;
};

/**
 * Calculates the global position of the display object
 *
 * @param position {PIXI.Point} The world origin to calculate from
 * @return {PIXI.Point} A point object representing the position of this object
 */
DisplayObject.prototype.toGlobal = function (position, point, skipUpdate)
{
    if(!skipUpdate)
    {
        this._recursivePostUpdateTransform();

        // this parent check is for just in case the item is a root object.
        // If it is we need to give it a temporary parent so that displayObjectUpdateTransform works correctly
        // this is mainly to avoid a parent check in the main loop. Every little helps for performance :)
        if(!this.parent)
        {
            this.parent = _tempDisplayObjectParent;
            this.displayObjectUpdateTransform();
            this.parent = null;
        }
        else
        {
            this.displayObjectUpdateTransform();
        }
    }

    // don't need to update the lot
    return this.worldTransform.apply(position, point);
};

/**
 * Calculates the local position of the display object relative to another point
 *
 * @param position {PIXI.Point} The world origin to calculate from
 * @param [from] {PIXI.DisplayObject} The DisplayObject to calculate the global position from
 * @param [point] {PIXI.Point} A Point object in which to store the value, optional (otherwise will create a new Point)
 * @return {PIXI.Point} A point object representing the position of this object
 */
DisplayObject.prototype.toLocal = function (position, from, point, skipUpdate)
{
    if (from)
    {
        position = from.toGlobal(position, point, skipUpdate);
    }

    if(! skipUpdate)
    {
        this._recursivePostUpdateTransform();

        // this parent check is for just in case the item is a root object.
        // If it is we need to give it a temporary parent so that displayObjectUpdateTransform works correctly
        // this is mainly to avoid a parent check in the main loop. Every little helps for performance :)
        if(!this.parent)
        {
            this.parent = _tempDisplayObjectParent;
            this.displayObjectUpdateTransform();
            this.parent = null;
        }
        else
        {
            this.displayObjectUpdateTransform();
        }
    }

    // simply apply the matrix..
    return this.worldTransform.applyInverse(position, point);
};

/**
 * Renders the object using the WebGL renderer
 *
 * @param renderer {PIXI.WebGLRenderer} The renderer
 */
DisplayObject.prototype.renderWebGL = function (renderer) // jshint unused:false
{
    // OVERWRITE;
};

/**
 * Renders the object using the Canvas renderer
 *
 * @param renderer {PIXI.CanvasRenderer} The renderer
 */
DisplayObject.prototype.renderCanvas = function (renderer) // jshint unused:false
{
    // OVERWRITE;
};

/**
 * Set the parent Container of this DisplayObject
 *
 * @param container {PIXI.Container} The Container to add this DisplayObject to
 * @return {PIXI.Container} The Container that this DisplayObject was added to
 */
DisplayObject.prototype.setParent = function (container)
{
    if (!container || !container.addChild)
    {
        throw new Error('setParent: Argument must be a Container');
    }

    container.addChild(this);
    return container;
};

/**
 * Convenience function to set the postion, scale, skew and pivot at once.
 *
 * @param [x=0] {number} The X position
 * @param [y=0] {number} The Y position
 * @param [scaleX=1] {number} The X scale value
 * @param [scaleY=1] {number} The Y scale value
 * @param [rotation=0] {number} The rotation
 * @param [skewX=0] {number} The X skew value
 * @param [skewY=0] {number} The Y skew value
 * @param [pivotX=0] {number} The X pivot value
 * @param [pivotY=0] {number} The Y pivot value
 * @return {PIXI.DisplayObject} The DisplayObject instance
 */
DisplayObject.prototype.setTransform = function(x, y, scaleX, scaleY, rotation, skewX, skewY, pivotX, pivotY) //jshint ignore:line
{
    this.position.x = x || 0;
    this.position.y = y || 0;
    this.scale.x = !scaleX ? 1 : scaleX;
    this.scale.y = !scaleY ? 1 : scaleY;
    this.rotation = rotation || 0;
    this.skew.x = skewX || 0;
    this.skew.y = skewY || 0;
    this.pivot.x = pivotX || 0;
    this.pivot.y = pivotY || 0;
    return this;
};

/**
 * Base destroy method for generic display objects. This will automatically
 * remove the display object from its parent Container as well as remove
 * all current event listeners and internal references. Do not use a DisplayObject 
 * after calling `destroy`.
 */
DisplayObject.prototype.destroy = function ()
{
    this.removeAllListeners();
    if (this.parent)
    {
        this.parent.removeChild(this);
    }
    this.transform = null;

    this.parent = null;

    this._bounds = null;
    this._currentBounds = null;
    this._mask = null;

    this.filterArea = null;
};
