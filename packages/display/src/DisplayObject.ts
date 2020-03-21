import { DEG_TO_RAD, Matrix, Point, RAD_TO_DEG, Rectangle, Transform } from '@pixi/math';
import { EventEmitter } from '@pixi/utils';
import { Container } from './Container';
import { Bounds } from './Bounds';

import type { Filter, MaskData, Renderer } from '@pixi/core';
import type { IPoint, ObservablePoint } from '@pixi/math';

export interface IDestroyOptions {
    children?: boolean;
    texture?: boolean;
    baseTexture?: boolean;
}

export interface DisplayObject extends GlobalMixins.DisplayObject, EventEmitter {}

/**
 * The base class for all objects that are rendered on the screen.
 *
 * This is an abstract class and should not be used on its own; rather it should b e extended.
 *
 * @class
 * @extends PIXI.utils.EventEmitter
 * @memberof PIXI
 */
export abstract class DisplayObject extends EventEmitter
{
    abstract sortDirty: boolean;

    public parent: DisplayObject;
    public worldAlpha: number;
    public transform: Transform;
    public alpha: number;
    public visible: boolean;
    public renderable: boolean;
    public filterArea: Rectangle;
    public filters: Filter[];
    public isSprite: boolean;
    public isMask: boolean;
    public _lastSortedIndex: number;
    public _mask: Container|MaskData;
    public _bounds: Bounds;
    public _localBounds: Bounds;

    protected _zIndex: number;
    protected _enabledFilters: Filter[];
    protected _boundsID: number;
    protected _boundsRect: Rectangle;
    protected _localBoundsRect: Rectangle;
    protected _destroyed: boolean;

    private tempDisplayObjectParent: TemporaryDisplayObject;
    public displayObjectUpdateTransform: () => void;

    /**
     * Mixes all enumerable properties and methods from a source object to DisplayObject.
     *
     * @param {object} source The source of properties and methods to mix in.
     */
    static mixin(source: {[x: string]: any}): void
    {
        // in ES8/ES2017, this would be really easy:
        // Object.defineProperties(DisplayObject.prototype, Object.getOwnPropertyDescriptors(source));

        // get all the enumerable property keys
        const keys = Object.keys(source);

        // loop through properties
        for (let i = 0; i < keys.length; ++i)
        {
            const propertyName = keys[i];

            // Set the property using the property descriptor - this works for accessors and normal value properties
            Object.defineProperty(
                DisplayObject.prototype,
                propertyName,
                Object.getOwnPropertyDescriptor(source, propertyName)
            );
        }
    }

    constructor()
    {
        super();

        this.tempDisplayObjectParent = null;

        // TODO: need to create Transform from factory
        /**
         * World transform and local transform of this object.
         * This will become read-only later, please do not assign anything there unless you know what are you doing.
         *
         * @member {PIXI.Transform}
         */
        this.transform = new Transform();

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
         * Only affects recursive calls from parent. You can ask for bounds or call updateTransform manually.
         *
         * @member {boolean}
         */
        this.visible = true;

        /**
         * Can this object be rendered, if false the object will not be drawn but the updateTransform
         * methods will still be called.
         *
         * Only affects recursive calls from parent. You can ask for bounds manually.
         *
         * @member {boolean}
         */
        this.renderable = true;

        /**
         * The display object container that contains this display object.
         *
         * @member {PIXI.Container}
         */
        this.parent = null;

        /**
         * The multiplied alpha of the displayObject.
         *
         * @member {number}
         * @readonly
         */
        this.worldAlpha = 1;

        /**
         * Which index in the children array the display component was before the previous zIndex sort.
         * Used by containers to help sort objects with the same zIndex, by using previous array index as the decider.
         *
         * @member {number}
         * @protected
         */
        this._lastSortedIndex = 0;

        /**
         * The zIndex of the displayObject.
         * A higher value will mean it will be rendered on top of other displayObjects within the same container.
         *
         * @member {number}
         * @protected
         */
        this._zIndex = 0;

        /**
         * The area the filter is applied to. This is used as more of an optimization
         * rather than figuring out the dimensions of the displayObject each frame you can set this rectangle.
         *
         * Also works as an interaction mask.
         *
         * @member {?PIXI.Rectangle}
         */
        this.filterArea = null;

        /**
         * Sets the filters for the displayObject.
         * * IMPORTANT: This is a WebGL only feature and will be ignored by the canvas renderer.
         * To remove filters simply set this property to `'null'`.
         *
         * @member {?PIXI.Filter[]}
         */
        this.filters = null;

        /**
         * Currently enabled filters
         * @member {PIXI.Filter[]}
         * @protected
         */
        this._enabledFilters = null;

        /**
         * The bounds object, this is used to calculate and store the bounds of the displayObject.
         *
         * @member {PIXI.Bounds}
         */
        this._bounds = new Bounds();

        /**
         * Local bounds object, swapped with `_bounds` when using `getLocalBounds()`.
         *
         * @member {PIXI.Bounds}
         */
        this._localBounds = null;

        /**
         * Flags the cached bounds as dirty.
         *
         * @member {number}
         * @protected
         */
        this._boundsID = 0;

        /**
         * Cache of this display-object's bounds-rectangle.
         *
         * @member {PIXI.Bounds}
         * @protected
         */
        this._boundsRect = null;

        /**
         * Cache of this display-object's local-bounds rectangle.
         *
         * @member {PIXI.Bounds}
         * @protected
         */
        this._localBoundsRect = null;

        /**
         * The original, cached mask of the object.
         *
         * @member {PIXI.Graphics|PIXI.Sprite|null}
         * @protected
         */
        this._mask = null;

        /**
         * Fired when this DisplayObject is added to a Container.
         *
         * @event PIXI.DisplayObject#added
         * @param {PIXI.Container} container - The container added to.
         */

        /**
         * Fired when this DisplayObject is removed from a Container.
         *
         * @event PIXI.DisplayObject#removed
         * @param {PIXI.Container} container - The container removed from.
         */

        /**
         * If the object has been destroyed via destroy(). If true, it should not be used.
         *
         * @member {boolean}
         * @protected
         */
        this._destroyed = false;

        /**
         * used to fast check if a sprite is.. a sprite!
         * @member {boolean}
         */
        this.isSprite = false;

        /**
         * Does any other displayObject use this object as a mask?
         * @member {boolean}
         */
        this.isMask = false;
    }

    /**
     * Recalculates the bounds of the display object.
     */
    abstract calculateBounds(): void;

    abstract removeChild(child: DisplayObject): void;

    /**
     * Renders the object using the WebGL renderer.
     *
     * @param {PIXI.Renderer} renderer - The renderer.
     */
    abstract render(renderer: Renderer): void;

    /**
     * Recursively updates transform of all objects from the root to this one
     * internal function for toLocal()
     */
    private _recursivePostUpdateTransform(): void
    {
        if (this.parent)
        {
            this.parent._recursivePostUpdateTransform();
            this.transform.updateTransform(this.parent.transform);
        }
        else
        {
            this.transform.updateTransform(this._tempDisplayObjectParent.transform);
        }
    }

    /**
     * Updates the object transform for rendering.
     *
     * TODO - Optimization pass!
     */
    updateTransform(): void
    {
        this._boundsID++;

        this.transform.updateTransform(this.parent.transform);
        // multiply the alphas..
        this.worldAlpha = this.alpha * this.parent.worldAlpha;
    }

    /**
     * Retrieves the bounds of the displayObject as a rectangle object.
     *
     * @param {boolean} [skipUpdate] - Setting to `true` will stop the transforms of the scene graph from
     *  being updated. This means the calculation returned MAY be out of date BUT will give you a
     *  nice performance boost.
     * @param {PIXI.Rectangle} [rect] - Optional rectangle to store the result of the bounds calculation.
     * @return {PIXI.Rectangle} The rectangular bounding area.
     */
    getBounds(skipUpdate?: boolean, rect?: Rectangle): Rectangle
    {
        if (!skipUpdate)
        {
            if (!this.parent)
            {
                this.parent = this._tempDisplayObjectParent;
                this.updateTransform();
                this.parent = null;
            }
            else
            {
                this._recursivePostUpdateTransform();
                this.updateTransform();
            }
        }

        if (this._bounds.updateID !== this._boundsID)
        {
            this.calculateBounds();
            this._bounds.updateID = this._boundsID;
        }

        if (!rect)
        {
            if (!this._boundsRect)
            {
                this._boundsRect = new Rectangle();
            }

            rect = this._boundsRect;
        }

        return this._bounds.getRectangle(rect);
    }

    /**
     * Retrieves the local bounds of the displayObject as a rectangle object.
     *
     * @param {PIXI.Rectangle} [rect] - Optional rectangle to store the result of the bounds calculation.
     * @return {PIXI.Rectangle} The rectangular bounding area.
     */
    getLocalBounds(rect?: Rectangle): Rectangle
    {
        if (!rect)
        {
            if (!this._localBoundsRect)
            {
                this._localBoundsRect = new Rectangle();
            }

            rect = this._localBoundsRect;
        }

        if (!this._localBounds)
        {
            this._localBounds = new Bounds();
        }

        const transformRef = this.transform;
        const parentRef = this.parent;

        this.parent = null;
        this.transform = this._tempDisplayObjectParent.transform;

        const worldBounds = this._bounds;
        const worldBoundsID = this._boundsID;

        this._bounds = this._localBounds;

        const bounds = this.getBounds(false, rect);

        this.parent = parentRef;
        this.transform = transformRef;

        this._bounds = worldBounds;
        this._bounds.updateID += this._boundsID - worldBoundsID;// reflect side-effects

        return bounds;
    }

    /**
     * Calculates the global position of the display object.
     *
     * @param {PIXI.IPoint} position - The world origin to calculate from.
     * @param {PIXI.Point} [point] - A Point object in which to store the value, optional
     *  (otherwise will create a new Point).
     * @param {boolean} [skipUpdate=false] - Should we skip the update transform.
     * @return {PIXI.Point} A point object representing the position of this object.
     */
    toGlobal(position: IPoint, point?: Point, skipUpdate = false): Point
    {
        if (!skipUpdate)
        {
            this._recursivePostUpdateTransform();

            // this parent check is for just in case the item is a root object.
            // If it is we need to give it a temporary parent so that displayObjectUpdateTransform works correctly
            // this is mainly to avoid a parent check in the main loop. Every little helps for performance :)
            if (!this.parent)
            {
                this.parent = this._tempDisplayObjectParent;
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
    }

    /**
     * Calculates the local position of the display object relative to another point.
     *
     * @param {PIXI.IPoint} position - The world origin to calculate from.
     * @param {PIXI.DisplayObject} [from] - The DisplayObject to calculate the global position from.
     * @param {PIXI.Point} [point] - A Point object in which to store the value, optional
     *  (otherwise will create a new Point).
     * @param {boolean} [skipUpdate=false] - Should we skip the update transform
     * @return {PIXI.Point} A point object representing the position of this object
     */
    toLocal(position: IPoint, from: DisplayObject, point?: Point, skipUpdate?: boolean): Point
    {
        if (from)
        {
            position = from.toGlobal(position, point, skipUpdate);
        }

        if (!skipUpdate)
        {
            this._recursivePostUpdateTransform();

            // this parent check is for just in case the item is a root object.
            // If it is we need to give it a temporary parent so that displayObjectUpdateTransform works correctly
            // this is mainly to avoid a parent check in the main loop. Every little helps for performance :)
            if (!this.parent)
            {
                this.parent = this._tempDisplayObjectParent;
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
    }

    /**
     * Set the parent Container of this DisplayObject.
     *
     * @param {PIXI.Container} container - The Container to add this DisplayObject to.
     * @return {PIXI.Container} The Container that this DisplayObject was added to.
     */
    setParent(container: Container): Container
    {
        if (!container || !container.addChild)
        {
            throw new Error('setParent: Argument must be a Container');
        }

        container.addChild(this);

        return container;
    }

    /**
     * Convenience function to set the position, scale, skew and pivot at once.
     *
     * @param {number} [x=0] - The X position
     * @param {number} [y=0] - The Y position
     * @param {number} [scaleX=1] - The X scale value
     * @param {number} [scaleY=1] - The Y scale value
     * @param {number} [rotation=0] - The rotation
     * @param {number} [skewX=0] - The X skew value
     * @param {number} [skewY=0] - The Y skew value
     * @param {number} [pivotX=0] - The X pivot value
     * @param {number} [pivotY=0] - The Y pivot value
     * @return {PIXI.DisplayObject} The DisplayObject instance
     */
    setTransform(x = 0, y = 0, scaleX = 1, scaleY = 1, rotation = 0, skewX = 0, skewY = 0, pivotX = 0, pivotY = 0): this
    {
        this.position.x = x;
        this.position.y = y;
        this.scale.x = !scaleX ? 1 : scaleX;
        this.scale.y = !scaleY ? 1 : scaleY;
        this.rotation = rotation;
        this.skew.x = skewX;
        this.skew.y = skewY;
        this.pivot.x = pivotX;
        this.pivot.y = pivotY;

        return this;
    }

    /**
     * Base destroy method for generic display objects. This will automatically
     * remove the display object from its parent Container as well as remove
     * all current event listeners and internal references. Do not use a DisplayObject
     * after calling `destroy()`.
     *
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    destroy(_options?: IDestroyOptions|boolean): void
    {
        if (this.parent)
        {
            this.parent.removeChild(this);
        }
        this.removeAllListeners();
        this.transform = null;

        this.parent = null;
        this._bounds = null;
        this._mask = null;

        this.filters = null;
        this.filterArea = null;
        this.hitArea = null;

        this.interactive = false;
        this.interactiveChildren = false;

        this._destroyed = true;
    }

    /**
     * @protected
     * @member {PIXI.Container}
     */
    get _tempDisplayObjectParent(): TemporaryDisplayObject
    {
        if (this.tempDisplayObjectParent === null)
        {
            // eslint-disable-next-line @typescript-eslint/no-use-before-define
            this.tempDisplayObjectParent = new TemporaryDisplayObject();
        }

        return this.tempDisplayObjectParent;
    }

    /**
     * The position of the displayObject on the x axis relative to the local coordinates of the parent.
     * An alias to position.x
     *
     * @member {number}
     */
    get x(): number
    {
        return this.position.x;
    }

    set x(value) // eslint-disable-line require-jsdoc
    {
        this.transform.position.x = value;
    }

    /**
     * The position of the displayObject on the y axis relative to the local coordinates of the parent.
     * An alias to position.y
     *
     * @member {number}
     */
    get y(): number
    {
        return this.position.y;
    }

    set y(value) // eslint-disable-line require-jsdoc
    {
        this.transform.position.y = value;
    }

    /**
     * Current transform of the object based on world (parent) factors.
     *
     * @member {PIXI.Matrix}
     * @readonly
     */
    get worldTransform(): Matrix
    {
        return this.transform.worldTransform;
    }

    /**
     * Current transform of the object based on local factors: position, scale, other stuff.
     *
     * @member {PIXI.Matrix}
     * @readonly
     */
    get localTransform(): Matrix
    {
        return this.transform.localTransform;
    }

    /**
     * The coordinate of the object relative to the local coordinates of the parent.
     * Assignment by value since pixi-v4.
     *
     * @member {PIXI.ObservablePoint}
     */
    get position(): ObservablePoint
    {
        return this.transform.position;
    }

    set position(value) // eslint-disable-line require-jsdoc
    {
        this.transform.position.copyFrom(value);
    }

    /**
     * The scale factor of the object.
     * Assignment by value since pixi-v4.
     *
     * @member {PIXI.ObservablePoint}
     */
    get scale(): ObservablePoint
    {
        return this.transform.scale;
    }

    set scale(value) // eslint-disable-line require-jsdoc
    {
        this.transform.scale.copyFrom(value);
    }

    /**
     * The pivot point of the displayObject that it rotates around.
     * Assignment by value since pixi-v4.
     *
     * @member {PIXI.ObservablePoint}
     */
    get pivot(): ObservablePoint
    {
        return this.transform.pivot;
    }

    set pivot(value) // eslint-disable-line require-jsdoc
    {
        this.transform.pivot.copyFrom(value);
    }

    /**
     * The skew factor for the object in radians.
     * Assignment by value since pixi-v4.
     *
     * @member {PIXI.ObservablePoint}
     */
    get skew(): ObservablePoint
    {
        return this.transform.skew;
    }

    set skew(value) // eslint-disable-line require-jsdoc
    {
        this.transform.skew.copyFrom(value);
    }

    /**
     * The rotation of the object in radians.
     * 'rotation' and 'angle' have the same effect on a display object; rotation is in radians, angle is in degrees.
     *
     * @member {number}
     */
    get rotation(): number
    {
        return this.transform.rotation;
    }

    set rotation(value) // eslint-disable-line require-jsdoc
    {
        this.transform.rotation = value;
    }

    /**
     * The angle of the object in degrees.
     * 'rotation' and 'angle' have the same effect on a display object; rotation is in radians, angle is in degrees.
     *
     * @member {number}
     */
    get angle(): number
    {
        return this.transform.rotation * RAD_TO_DEG;
    }

    set angle(value) // eslint-disable-line require-jsdoc
    {
        this.transform.rotation = value * DEG_TO_RAD;
    }

    /**
     * The zIndex of the displayObject.
     * If a container has the sortableChildren property set to true, children will be automatically
     * sorted by zIndex value; a higher value will mean it will be moved towards the end of the array,
     * and thus rendered on top of other displayObjects within the same container.
     *
     * @member {number}
     */
    get zIndex(): number
    {
        return this._zIndex;
    }

    set zIndex(value) // eslint-disable-line require-jsdoc
    {
        this._zIndex = value;
        if (this.parent)
        {
            this.parent.sortDirty = true;
        }
    }

    /**
     * Indicates if the object is globally visible.
     *
     * @member {boolean}
     * @readonly
     */
    get worldVisible(): boolean
    {
        let item = this as DisplayObject;

        do
        {
            if (!item.visible)
            {
                return false;
            }

            item = item.parent;
        } while (item);

        return true;
    }

    /**
     * Sets a mask for the displayObject. A mask is an object that limits the visibility of an
     * object to the shape of the mask applied to it. In PixiJS a regular mask must be a
     * {@link PIXI.Graphics} or a {@link PIXI.Sprite} object. This allows for much faster masking in canvas as it
     * utilities shape clipping. To remove a mask, set this property to `null`.
     *
     * For sprite mask both alpha and red channel are used. Black mask is the same as transparent mask.
     * @example
     * const graphics = new PIXI.Graphics();
     * graphics.beginFill(0xFF3300);
     * graphics.drawRect(50, 250, 100, 100);
     * graphics.endFill();
     *
     * const sprite = new PIXI.Sprite(texture);
     * sprite.mask = graphics;
     * @todo At the moment, PIXI.CanvasRenderer doesn't support PIXI.Sprite as mask.
     *
     * @member {PIXI.Container|PIXI.MaskData}
     */
    get mask(): Container|MaskData
    {
        return this._mask;
    }

    set mask(value) // eslint-disable-line require-jsdoc
    {
        if (this._mask)
        {
            const maskObject = ((this._mask as MaskData).maskObject || this._mask) as Container;

            maskObject.renderable = true;
            maskObject.isMask = false;
        }

        this._mask = value;

        if (this._mask)
        {
            const maskObject = ((this._mask as MaskData).maskObject || this._mask) as Container;

            maskObject.renderable = false;
            maskObject.isMask = true;
        }
    }
}

export class TemporaryDisplayObject extends DisplayObject
{
    calculateBounds: () => {} = null;
    removeChild: (child: DisplayObject) => {} = null;
    render: (renderer: Renderer) => {} = null;
    sortDirty: boolean = null;
}

/**
 * DisplayObject default updateTransform, does not update children of container.
 * Will crash if there's no parent element.
 *
 * @memberof PIXI.DisplayObject#
 * @function displayObjectUpdateTransform
 */
DisplayObject.prototype.displayObjectUpdateTransform = DisplayObject.prototype.updateTransform;
