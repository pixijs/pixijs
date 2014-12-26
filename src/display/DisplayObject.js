var math = require('../math'),
    Sprite = require('./Sprite'),
    RenderTexture = require('../textures/RenderTexture'),
    _tempMatrix = new math.Matrix();

/**
 * The base class for all objects that are rendered on the screen.
 * This is an abstract class and should not be used on its own rather it should be extended.
 *
 * @class
 * @namespace PIXI
 */
function DisplayObject() {
    /**
     * The coordinate of the object relative to the local coordinates of the parent.
     *
     * @member {Point}
     */
    this.position = new math.Point();

    /**
     * The scale factor of the object.
     *
     * @member {Point}
     */
    this.scale = new math.Point(1,1);//{x:1, y:1};

    /**
     * The pivot point of the displayObject that it rotates around
     *
     * @member {Point}
     */
    this.pivot = new math.Point(0,0);

    /**
     * The rotation of the object in radians.
     *
     * @member {number}
     */
    this.rotation = 0;

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
     * This is the defined area that will pick up mouse / touch events. It is null by default.
     * Setting it is a neat way of optimising the hitTest function that the interactionManager
     * will use (as it will not need to hit test all the children)
     *
     * @member {Rectangle|Circle|Ellipse|Polygon}
     */
    this.hitArea = null;

    /**
     * This is used to indicate if the displayObject should display a mouse hand cursor on rollover
     *
     * @member {boolean}
     */
    this.buttonMode = false;

    /**
     * Can this object be rendered, if false the object will not be drawn but the updateTransform
     * methods will still be called.
     *
     * @member {boolean}
     */
    this.renderable = false;

    /**
     * The display object container that contains this display object.
     *
     * @member {DisplayObjectContainer}
     * @readOnly
     */
    this.parent = null;

    /**
     * The stage the display object is connected to, or undefined if it is not
     * connected to the stage.
     *
     * @member {Stage}
     * @readOnly
     */
    this.stage = null;

    /**
     * The multiplied alpha of the displayObject
     *
     * @member {number}
     * @readOnly
     */
    this.worldAlpha = 1;

    /**
     * Whether or not the object is interactive, do not toggle directly! use
     * the `interactive` property
     *
     * @member {Boolean}
     * @readOnly
     * @private
     */
    this._interactive = false;

    /**
     * This is the cursor that will be used when the mouse is over this object. To enable this
     * the element must have interaction = true and buttonMode = true
     *
     * @member {string}
     *
    */
    this.defaultCursor = 'pointer';

    /**
     * Current transform of the object based on world (parent) factors
     *
     * @member {Matrix}
     * @readOnly
     * @private
     */
    this.worldTransform = new math.Matrix();

    /**
     * cached sin rotation and cos rotation
     *
     * @member {number}
     * @private
     */
    this._sr = 0;

    /**
     * cached sin rotation and cos rotation
     *
     * @member {number}
     * @private
     */
    this._cr = 1;

    /**
     * The area the filter is applied to like the hitArea this is used as more of an optimisation
     * rather than figuring out the dimensions of the displayObject each frame you can set this rectangle
     *
     * @member {Rectangle}
     */
    this.filterArea = null; // new math.Rectangle(0,0,1,1);

    /**
     * The original, cached bounds of the object
     *
     * @member {Rectangle}
     * @private
     */
    this._bounds = new math.Rectangle(0, 0, 1, 1);

    /**
     * The most up-to-date bounds of the object
     *
     * @member {Rectangle}
     * @private
     */
    this._currentBounds = null;

    /**
     * The original, cached mask of the object
     *
     * @member {Rectangle}
     * @private
     */
    this._mask = null;

    /**
     * Cached internal flag.
     *
     * @member {boolean}
     * @private
     */
    this._cacheAsBitmap = false;

    /**
     * Cached internal flag.
     *
     * @member {boolean}
     * @private
     */
    this._cacheIsDirty = false;


    /*
     * MOUSE Callbacks
     */

    /**
     * A callback that is used when the users mouse rolls over the displayObject
     *
     * @method mouseover
     * @memberof DisplayObject#
     * @param interactionData {InteractionData}
     */
    this.mouseover = null;

    /**
     * A callback that is used when the users mouse leaves the displayObject
     *
     * @method mouseout
     * @memberof DisplayObject#
     * @param interactionData {InteractionData}
     */
    this.mouseout = null;

    //Left button
    /**
     * A callback that is used when the users clicks on the displayObject with their mouse's left button
     *
     * @method click
     * @memberof DisplayObject#
     * @param interactionData {InteractionData}
     */
    this.click = null;

    /**
     * A callback that is used when the user clicks the mouse's left button down over the sprite
     *
     * @method mousedown
     * @memberof DisplayObject#
     * @param interactionData {InteractionData}
     */
    this.mousedown = null;

    /**
     * A callback that is used when the user releases the mouse's left button that was over the displayObject
     * for this callback to be fired, the mouse's left button must have been pressed down over the displayObject
     *
     * @method mouseup
     * @memberof DisplayObject#
     * @param interactionData {InteractionData}
     */
    this.mouseup = null;

    /**
     * A callback that is used when the user releases the mouse's left button that was over the displayObject
     * but is no longer over the displayObject for this callback to be fired, the mouse's left button must
     * have been pressed down over the displayObject
     *
     * @method mouseupoutside
     * @memberof DisplayObject#
     * @param interactionData {InteractionData}
     */
    this.mouseupoutside = null;

    //Right button
    /**
     * A callback that is used when the users clicks on the displayObject with their mouse's right button
     *
     * @method rightclick
     * @memberof DisplayObject#
     * @param interactionData {InteractionData}
     */
    this.rightclick = null;

    /**
     * A callback that is used when the user clicks the mouse's right button down over the sprite
     *
     * @method rightdown
     * @memberof DisplayObject#
     * @param interactionData {InteractionData}
     */
    this.rightdown = null;

    /**
     * A callback that is used when the user releases the mouse's right button that was over the displayObject
     * for this callback to be fired the mouse's right button must have been pressed down over the displayObject
     *
     * @method rightup
     * @memberof DisplayObject#
     * @param interactionData {InteractionData}
     */
    this.rightup = null;

    /**
     * A callback that is used when the user releases the mouse's right button that was over the
     * displayObject but is no longer over the displayObject for this callback to be fired, the mouse's
     * right button must have been pressed down over the displayObject
     *
     * @method rightupoutside
     * @memberof DisplayObject#
     * @param interactionData {InteractionData}
     */
    this.rightupoutside = null;

    /*
     * TOUCH Callbacks
     */

    /**
     * A callback that is used when the users taps on the sprite with their finger
     * basically a touch version of click
     *
     * @method tap
     * @memberof DisplayObject#
     * @param interactionData {InteractionData}
     */
    this.tap = null;

    /**
     * A callback that is used when the user touches over the displayObject
     *
     * @method touchstart
     * @memberof DisplayObject#
     * @param interactionData {InteractionData}
     */
    this.touchstart = null;

    /**
     * A callback that is used when the user releases a touch over the displayObject
     *
     * @method touchend
     * @memberof DisplayObject#
     * @param interactionData {InteractionData}
     */
    this.touchend = null;

    /**
     * A callback that is used when the user releases the touch that was over the displayObject
     * for this callback to be fired, The touch must have started over the sprite
     *
     * @method touchendoutside
     * @memberof DisplayObject#
     * @param interactionData {InteractionData}
     */
    this.touchendoutside = null;
};

// constructor
DisplayObject.prototype.constructor = DisplayObject;
module.exports = DisplayObject;

Object.defineProperties(DisplayObject.prototype, {
    /**
     * The position of the displayObject on the x axis relative to the local coordinates of the parent.
     *
     * @member {number}
     * @memberof DisplayObject#
     */
    x: {
        get: function () {
            return this.position.x;
        },
        set: function (value) {
            this.position.x = value;
        }
    },

    /**
     * The position of the displayObject on the y axis relative to the local coordinates of the parent.
     *
     * @member {number}
     * @memberof DisplayObject#
     */
    y: {
        get: function () {
            return this.position.y;
        },
        set: function (value) {
            this.position.y = value;
        }
    },

    /**
     * Indicates if the sprite will have touch and mouse interactivity. It is false by default
     *
     * @member {boolean}
     * @default false
     * @memberof DisplayObject#
     */
    interactive: {
        get: function () {
            return this._interactive;
        },
        set: function (value) {
            this._interactive = value;

            // TODO more to be done here..
            // need to sort out a re-crawl!
            if(this.stage) {
                this.stage.dirty = true;
            }
        }
    },

    /**
     * Indicates if the sprite is globally visible.
     *
     * @member {boolean}
     * @readonly
     * @memberof DisplayObject#
     */
    worldVisible: {
        get: function () {
            var item = this;

            do {
                if (!item.visible) {
                    return false;
                }

                item = item.parent;
            } while(item);

            return true;
        }
    },

    /**
     * Sets a mask for the displayObject. A mask is an object that limits the visibility of an object to the shape of the mask applied to it.
     * In PIXI a regular mask must be a PIXI.Graphics object. This allows for much faster masking in canvas as it utilises shape clipping.
     * To remove a mask, set this property to null.
     *
     * @member {Graphics}
     * @memberof DisplayObject#
     */
    mask: {
        get: function () {
            return this._mask;
        },
        set: function (value) {
            if (this._mask) {
                this._mask.isMask = false;
            }

            this._mask = value;

            if (this._mask) {
                this._mask.isMask = true;
            }
        }
    },

    /**
     * Sets the filters for the displayObject.
     * * IMPORTANT: This is a webGL only feature and will be ignored by the canvas renderer.
     * To remove filters simply set this property to 'null'
     *
     * @member {Filter[]}
     * @memberof DisplayObject#
     */
    filters: {
        get: function () {
            return this._filters;
        },
        set: function (value) {
            if (value) {
                // now put all the passes in one place..
                var passes = [];

                for (var i = 0; i < value.length; i++) {
                    var filterPasses = value[i].passes;

                    for (var j = 0; j < filterPasses.length; j++) {
                        passes.push(filterPasses[j]);
                    }
                }

                // TODO change this as it is legacy
                this._filterBlock = { target: this, filterPasses: passes };
            }

            this._filters = value;
        }
    },

    /**
     * Set if this display object is cached as a bitmap.
     * This basically takes a snap shot of the display object as it is at that moment. It can provide a performance benefit for complex static displayObjects.
     * To remove simply set this property to 'null'
     *
     * @member {boolean}
     * @memberof DisplayObject#
     */
    cacheAsBitmap: {
        get: function () {
            return this._cacheAsBitmap;
        },
        set: function (value) {
            if (this._cacheAsBitmap === value) {
                return;
            }

            if (value) {
                this._generateCachedSprite();
            }
            else {
                this._destroyCachedSprite();
            }

            this._cacheAsBitmap = value;
        }
    }
});

/*
 * Updates the object transform for rendering
 *
 * @private
 */
DisplayObject.prototype.updateTransform = function () {
    // create some matrix refs for easy access
    var pt = this.parent.worldTransform;
    var wt = this.worldTransform;

    // temporary matrix variables
    var a, b, c, d, tx, ty;

    // so if rotation is between 0 then we can simplify the multiplication process..
    if(this.rotation % math.PI_2)
    {
        // check to see if the rotation is the same as the previous render. This means we only need to use sin and cos when rotation actually changes
        if(this.rotation !== this.rotationCache)
        {
            this.rotationCache = this.rotation;
            this._sr = Math.sin(this.rotation);
            this._cr = Math.cos(this.rotation);
        }

        // get the matrix values of the displayobject based on its transform properties..
        a  =  this._cr * this.scale.x;
        b  =  this._sr * this.scale.x;
        c  = -this._sr * this.scale.y;
        d  =  this._cr * this.scale.y;
        tx =  this.position.x;
        ty =  this.position.y;

        // check for pivot.. not often used so geared towards that fact!
        if(this.pivot.x || this.pivot.y)
        {
            tx -= this.pivot.x * a + this.pivot.y * c;
            ty -= this.pivot.x * b + this.pivot.y * d;
        }

        // concat the parent matrix with the objects transform.
        wt.a  = a  * pt.a + b  * pt.c;
        wt.b  = a  * pt.b + b  * pt.d;
        wt.c  = c  * pt.a + d  * pt.c;
        wt.d  = c  * pt.b + d  * pt.d;
        wt.tx = tx * pt.a + ty * pt.c + pt.tx;
        wt.ty = tx * pt.b + ty * pt.d + pt.ty;


    }
    else
    {
        // lets do the fast version as we know there is no rotation..
        a  = this.scale.x;
        d  = this.scale.y;

        tx = this.position.x - this.pivot.x * a;
        ty = this.position.y - this.pivot.y * d;

        wt.a  = a  * pt.a;
        wt.b  = a  * pt.b;
        wt.c  = d  * pt.c;
        wt.d  = d  * pt.d;
        wt.tx = tx * pt.a + ty * pt.c + pt.tx;
        wt.ty = tx * pt.b + ty * pt.d + pt.ty;
    }

    // multiply the alphas..
    this.worldAlpha = this.alpha * this.parent.worldAlpha;
};

// performance increase to avoid using call.. (10x faster)
DisplayObject.prototype.displayObjectUpdateTransform = DisplayObject.prototype.updateTransform;

/**
 * Retrieves the bounds of the displayObject as a rectangle object
 *
 * @param matrix {Matrix}
 * @return {Rectangle} the rectangular bounding area
 */
DisplayObject.prototype.getBounds = function (matrix) {
    return math.Rectangle.EMPTY;
};

/**
 * Retrieves the local bounds of the displayObject as a rectangle object
 *
 * @return {Rectangle} the rectangular bounding area
 */
DisplayObject.prototype.getLocalBounds = function () {
    return this.getBounds(math.Matrix.IDENTITY);
};

/**
 * Sets the object's stage reference, the stage this object is connected to
 *
 * @param stage {Stage} the stage that the object will have as its current stage reference
 */
DisplayObject.prototype.setStageReference = function (stage) {
    this.stage = stage;

    if (this._interactive) {
        this.stage.dirty = true;
    }
};

/**
 * Useful function that returns a texture of the displayObject object that can then be used to create sprites
 * This can be quite useful if your displayObject is static / complicated and needs to be reused multiple times.
 *
 * @param resolution {Number} The resolution of the texture being generated
 * @param scaleMode {Number} See {{#crossLink "PIXI/scaleModes:property"}}PIXI.scaleModes{{/crossLink}} for possible values
 * @param renderer {CanvasRenderer|WebGLRenderer} The renderer used to generate the texture.
 * @return {Texture} a texture of the graphics object
 */
DisplayObject.prototype.generateTexture = function (resolution, scaleMode, renderer) {
    var bounds = this.getLocalBounds();

    var renderTexture = new RenderTexture(bounds.width | 0, bounds.height | 0, renderer, scaleMode, resolution);

    _tempMatrix.tx = -bounds.x;
    _tempMatrix.ty = -bounds.y;

    renderTexture.render(this, _tempMatrix);

    return renderTexture;
};

/**
 * Generates and updates the cached sprite for this object.
 *
 */
DisplayObject.prototype.updateCache = function () {
    this._generateCachedSprite();
};

/**
 * Calculates the global position of the display object
 *
 * @param position {Point} The world origin to calculate from
 * @return {Point} A point object representing the position of this object
 */
DisplayObject.prototype.toGlobal = function (position) {
    // don't need to u[date the lot
    this.displayObjectUpdateTransform();
    return this.worldTransform.apply(position);
};

/**
 * Calculates the local position of the display object relative to another point
 *
 * @param position {Point} The world origin to calculate from
 * @param [from] {DisplayObject} The DisplayObject to calculate the global position from
 * @return {Point} A point object representing the position of this object
 */
DisplayObject.prototype.toLocal = function (position, from) {
    if (from) {
        position = from.toGlobal(position);
    }

    // don't need to update the lot
    this.displayObjectUpdateTransform();
    return this.worldTransform.applyInverse(position);
};

/**
 * Internal method.
 *
 * @param renderSession {Object} The render session
 * @private
 */
DisplayObject.prototype._renderCachedSprite = function (renderSession) {
    this._cachedSprite.worldAlpha = this.worldAlpha;

    if (renderSession.gl) {
        Sprite.prototype._renderWebGL.call(this._cachedSprite, renderSession);
    }
    else {
        Sprite.prototype._renderCanvas.call(this._cachedSprite, renderSession);
    }
};

/**
 * Internal method.
 *
 * @private
 */
DisplayObject.prototype._generateCachedSprite = function () {
    this._cacheAsBitmap = false;
    var bounds = this.getLocalBounds();

    if (!this._cachedSprite) {
        var renderTexture = new RenderTexture(bounds.width | 0, bounds.height | 0); //, renderSession.renderer);

        this._cachedSprite = new Sprite(renderTexture);
        this._cachedSprite.worldTransform = this.worldTransform;
    }
    else {
        this._cachedSprite.texture.resize(bounds.width | 0, bounds.height | 0);
    }

    // REMOVE filter!
    var tempFilters = this._filters;
    this._filters = null;

    this._cachedSprite.filters = tempFilters;

    _tempMatrix.tx = -bounds.x;
    _tempMatrix.ty = -bounds.y;

    this._cachedSprite.texture.render(this, _tempMatrix, true);

    this._cachedSprite.anchor.x = -(bounds.x / bounds.width);
    this._cachedSprite.anchor.y = -(bounds.y / bounds.height);

    this._filters = tempFilters;

    this._cacheAsBitmap = true;
};

/**
 * Destroys the cached sprite.
 *
 * @private
 */
DisplayObject.prototype._destroyCachedSprite = function () {
    if (!this._cachedSprite) {
        return;
    }

    this._cachedSprite.texture.destroy(true);

    // TODO could be object pooled!
    this._cachedSprite = null;
};

/**
 * Renders the object using the WebGL renderer
 *
 * @param renderSession {RenderSession}
 * @private
 */
DisplayObject.prototype._renderWebGL = function (renderSession) {
    // OVERWRITE;
};

/**
 * Renders the object using the Canvas renderer
 *
 * @param renderSession {RenderSession}
 * @private
 */
DisplayObject.prototype._renderCanvas = function (renderSession) {
    // OVERWRITE;
};
