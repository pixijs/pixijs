import type { Dict } from '@pixi/utils';
import { EventEmitter } from '@pixi/utils';
import type { Filter } from '@pixi/core';
import type { IPointData } from '@pixi/math';
import type { MaskData } from '@pixi/core';
import { Matrix } from '@pixi/math';
import type { ObservablePoint } from '@pixi/math';
import { Point } from '@pixi/math';
import { Rectangle } from '@pixi/math';
import type { Renderer } from '@pixi/core';
import { Transform } from '@pixi/math';

/**
 * 'Builder' pattern for bounds rectangles.
 *
 * This could be called an Axis-Aligned Bounding Box.
 * It is not an actual shape. It is a mutable thing; no 'EMPTY' or those kind of problems.
 *
 * @class
 * @memberof PIXI
 */
export declare class Bounds
{
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
    rect: Rectangle;
    updateID: number;
    constructor();
    /**
     * Checks if bounds are empty.
     *
     * @return {boolean} True if empty.
     */
    isEmpty(): boolean;
    /**
     * Clears the bounds and resets.
     *
     */
    clear(): void;
    /**
     * Can return Rectangle.EMPTY constant, either construct new rectangle, either use your rectangle
     * It is not guaranteed that it will return tempRect
     *
     * @param {PIXI.Rectangle} rect - temporary object will be used if AABB is not empty
     * @returns {PIXI.Rectangle} A rectangle of the bounds
     */
    getRectangle(rect?: Rectangle): Rectangle;
    /**
     * This function should be inlined when its possible.
     *
     * @param {PIXI.IPointData} point - The point to add.
     */
    addPoint(point: IPointData): void;
    /**
     * Adds a quad, not transformed
     *
     * @param {Float32Array} vertices - The verts to add.
     */
    addQuad(vertices: Float32Array): void;
    /**
     * Adds sprite frame, transformed.
     *
     * @param {PIXI.Transform} transform - transform to apply
     * @param {number} x0 - left X of frame
     * @param {number} y0 - top Y of frame
     * @param {number} x1 - right X of frame
     * @param {number} y1 - bottom Y of frame
     */
    addFrame(transform: Transform, x0: number, y0: number, x1: number, y1: number): void;
    /**
     * Adds sprite frame, multiplied by matrix
     *
     * @param {PIXI.Matrix} matrix - matrix to apply
     * @param {number} x0 - left X of frame
     * @param {number} y0 - top Y of frame
     * @param {number} x1 - right X of frame
     * @param {number} y1 - bottom Y of frame
     */
    addFrameMatrix(matrix: Matrix, x0: number, y0: number, x1: number, y1: number): void;
    /**
     * Adds screen vertices from array
     *
     * @param {Float32Array} vertexData - calculated vertices
     * @param {number} beginOffset - begin offset
     * @param {number} endOffset - end offset, excluded
     */
    addVertexData(vertexData: Float32Array, beginOffset: number, endOffset: number): void;
    /**
     * Add an array of mesh vertices
     *
     * @param {PIXI.Transform} transform - mesh transform
     * @param {Float32Array} vertices - mesh coordinates in array
     * @param {number} beginOffset - begin offset
     * @param {number} endOffset - end offset, excluded
     */
    addVertices(transform: Transform, vertices: Float32Array, beginOffset: number, endOffset: number): void;
    /**
     * Add an array of mesh vertices.
     *
     * @param {PIXI.Matrix} matrix - mesh matrix
     * @param {Float32Array} vertices - mesh coordinates in array
     * @param {number} beginOffset - begin offset
     * @param {number} endOffset - end offset, excluded
     * @param {number} [padX=0] - x padding
     * @param {number} [padY=0] - y padding
     */
    addVerticesMatrix(matrix: Matrix, vertices: Float32Array, beginOffset: number, endOffset: number, padX?: number, padY?: number): void;
    /**
     * Adds other Bounds.
     *
     * @param {PIXI.Bounds} bounds - The Bounds to be added
     */
    addBounds(bounds: Bounds): void;
    /**
     * Adds other Bounds, masked with Bounds.
     *
     * @param {PIXI.Bounds} bounds - The Bounds to be added.
     * @param {PIXI.Bounds} mask - TODO
     */
    addBoundsMask(bounds: Bounds, mask: Bounds): void;
    /**
     * Adds other Bounds, multiplied by matrix. Bounds shouldn't be empty.
     *
     * @param {PIXI.Bounds} bounds - other bounds
     * @param {PIXI.Matrix} matrix - multiplicator
     */
    addBoundsMatrix(bounds: Bounds, matrix: Matrix): void;
    /**
     * Adds other Bounds, masked with Rectangle.
     *
     * @param {PIXI.Bounds} bounds - TODO
     * @param {PIXI.Rectangle} area - TODO
     */
    addBoundsArea(bounds: Bounds, area: Rectangle): void;
    /**
     * Pads bounds object, making it grow in all directions.
     * If paddingY is omitted, both paddingX and paddingY will be set to paddingX.
     *
     * @param {number} [paddingX=0] - The horizontal padding amount.
     * @param {number} [paddingY=0] - The vertical padding amount.
     */
    pad(paddingX?: number, paddingY?: number): void;
    /**
     * Adds padded frame. (x0, y0) should be strictly less than (x1, y1)
     *
     * @param {number} x0 - left X of frame
     * @param {number} y0 - top Y of frame
     * @param {number} x1 - right X of frame
     * @param {number} y1 - bottom Y of frame
     * @param {number} padX - padding X
     * @param {number} padY - padding Y
     */
    addFramePad(x0: number, y0: number, x1: number, y1: number, padX: number, padY: number): void;
}

export declare interface Container extends GlobalMixins.Container, DisplayObject {
}

/**
 * A Container represents a collection of display objects.
 *
 * It is the base class of all display objects that act as a container for other objects (like Sprites).
 *
 *```js
 * let container = new PIXI.Container();
 * container.addChild(sprite);
 * ```
 *
 * @class
 * @extends PIXI.DisplayObject
 * @memberof PIXI
 */
export declare class Container extends DisplayObject
{
    readonly children: DisplayObject[];
    sortableChildren: boolean;
    sortDirty: boolean;
    containerUpdateTransform: () => void;
    protected _width: number;
    protected _height: number;
    constructor();
    /**
     * Overridable method that can be used by Container subclasses whenever the children array is modified
     *
     * @protected
     */
    protected onChildrenChange(_length: number): void;
    /**
     * Adds one or more children to the container.
     *
     * Multiple items can be added like so: `myContainer.addChild(thingOne, thingTwo, thingThree)`
     *
     * @param {...PIXI.DisplayObject} children - The DisplayObject(s) to add to the container
     * @return {PIXI.DisplayObject} The first child that was added.
     */
    addChild<T extends DisplayObject[]>(...children: T): T[0];
    /**
     * Adds a child to the container at a specified index. If the index is out of bounds an error will be thrown
     *
     * @param {PIXI.DisplayObject} child - The child to add
     * @param {number} index - The index to place the child in
     * @return {PIXI.DisplayObject} The child that was added.
     */
    addChildAt<T extends DisplayObject>(child: T, index: number): T;
    /**
     * Swaps the position of 2 Display Objects within this container.
     *
     * @param {PIXI.DisplayObject} child - First display object to swap
     * @param {PIXI.DisplayObject} child2 - Second display object to swap
     */
    swapChildren(child: DisplayObject, child2: DisplayObject): void;
    /**
     * Returns the index position of a child DisplayObject instance
     *
     * @param {PIXI.DisplayObject} child - The DisplayObject instance to identify
     * @return {number} The index position of the child display object to identify
     */
    getChildIndex(child: DisplayObject): number;
    /**
     * Changes the position of an existing child in the display object container
     *
     * @param {PIXI.DisplayObject} child - The child DisplayObject instance for which you want to change the index number
     * @param {number} index - The resulting index number for the child display object
     */
    setChildIndex(child: DisplayObject, index: number): void;
    /**
     * Returns the child at the specified index
     *
     * @param {number} index - The index to get the child at
     * @return {PIXI.DisplayObject} The child at the given index, if any.
     */
    getChildAt(index: number): DisplayObject;
    /**
     * Removes one or more children from the container.
     *
     * @param {...PIXI.DisplayObject} children - The DisplayObject(s) to remove
     * @return {PIXI.DisplayObject} The first child that was removed.
     */
    removeChild<T extends DisplayObject[]>(...children: T): T[0];
    /**
     * Removes a child from the specified index position.
     *
     * @param {number} index - The index to get the child from
     * @return {PIXI.DisplayObject} The child that was removed.
     */
    removeChildAt(index: number): DisplayObject;
    /**
     * Removes all children from this container that are within the begin and end indexes.
     *
     * @param {number} [beginIndex=0] - The beginning position.
     * @param {number} [endIndex=this.children.length] - The ending position. Default value is size of the container.
     * @returns {PIXI.DisplayObject[]} List of removed children
     */
    removeChildren(beginIndex?: number, endIndex?: number): DisplayObject[];
    /**
     * Sorts children by zIndex. Previous order is mantained for 2 children with the same zIndex.
     */
    sortChildren(): void;
    /**
     * Updates the transform on all children of this container for rendering
     */
    updateTransform(): void;
    /**
     * Recalculates the bounds of the container.
     *
     */
    calculateBounds(): void;
    /**
     * Retrieves the local bounds of the displayObject as a rectangle object.
     *
     * @param {PIXI.Rectangle} [rect] - Optional rectangle to store the result of the bounds calculation.
     * @param {boolean} [skipChildrenUpdate=false] - Setting to `true` will stop re-calculation of children transforms,
     *  it was default behaviour of pixi 4.0-5.2 and caused many problems to users.
     * @return {PIXI.Rectangle} The rectangular bounding area.
     */
    getLocalBounds(rect?: Rectangle, skipChildrenUpdate?: boolean): Rectangle;
    /**
     * Recalculates the bounds of the object. Override this to
     * calculate the bounds of the specific object (not including children).
     *
     * @protected
     */
    protected _calculateBounds(): void;
    /**
     * Renders the object using the WebGL renderer
     *
     * @param {PIXI.Renderer} renderer - The renderer
     */
    render(renderer: Renderer): void;
    /**
     * Render the object using the WebGL renderer and advanced features.
     *
     * @protected
     * @param {PIXI.Renderer} renderer - The renderer
     */
    protected renderAdvanced(renderer: Renderer): void;
    /**
     * To be overridden by the subclasses.
     *
     * @protected
     * @param {PIXI.Renderer} renderer - The renderer
     */
    protected _render(_renderer: Renderer): void;
    /**
     * Removes all internal references and listeners as well as removes children from the display list.
     * Do not use a Container after calling `destroy`.
     *
     * @param {object|boolean} [options] - Options parameter. A boolean will act as if all options
     *  have been set to that value
     * @param {boolean} [options.children=false] - if set to true, all the children will have their destroy
     *  method called as well. 'options' will be passed on to those calls.
     * @param {boolean} [options.texture=false] - Only used for child Sprites if options.children is set to true
     *  Should it destroy the texture of the child sprite
     * @param {boolean} [options.baseTexture=false] - Only used for child Sprites if options.children is set to true
     *  Should it destroy the base texture of the child sprite
     */
    destroy(options?: IDestroyOptions | boolean): void;
    /**
     * The width of the Container, setting this will actually modify the scale to achieve the value set
     *
     * @member {number}
     */
    get width(): number;
    set width(value: number);
    /**
     * The height of the Container, setting this will actually modify the scale to achieve the value set
     *
     * @member {number}
     */
    get height(): number;
    set height(value: number);
}

export declare interface DisplayObject extends GlobalMixins.DisplayObject, EventEmitter {
}

/**
 * The base class for all objects that are rendered on the screen.
 *
 * This is an abstract class and should not be used on its own; rather it should b e extended.
 *
 * @class
 * @extends PIXI.utils.EventEmitter
 * @memberof PIXI
 */
export declare abstract class DisplayObject extends EventEmitter
{
    abstract sortDirty: boolean;
    parent: DisplayObject;
    worldAlpha: number;
    transform: Transform;
    alpha: number;
    visible: boolean;
    renderable: boolean;
    filterArea: Rectangle;
    filters: Filter[];
    isSprite: boolean;
    isMask: boolean;
    _lastSortedIndex: number;
    _mask: Container | MaskData;
    _bounds: Bounds;
    _localBounds: Bounds;
    protected _zIndex: number;
    protected _enabledFilters: Filter[];
    protected _boundsID: number;
    protected _boundsRect: Rectangle;
    protected _localBoundsRect: Rectangle;
    protected _destroyed: boolean;
    private tempDisplayObjectParent;
    displayObjectUpdateTransform: () => void;
    /**
     * Mixes all enumerable properties and methods from a source object to DisplayObject.
     *
     * @param {object} source - The source of properties and methods to mix in.
     */
    static mixin(source: Dict<any>): void;
    constructor();
    /**
     * Fired when this DisplayObject is added to a Container.
     *
     * @instance
     * @event added
     * @param {PIXI.Container} container - The container added to.
     */
    /**
     * Fired when this DisplayObject is removed from a Container.
     *
     * @instance
     * @event removed
     * @param {PIXI.Container} container - The container removed from.
     */
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
    protected _recursivePostUpdateTransform(): void;
    /**
     * Updates the object transform for rendering.
     *
     * TODO - Optimization pass!
     */
    updateTransform(): void;
    /**
     * Retrieves the bounds of the displayObject as a rectangle object.
     *
     * @param {boolean} [skipUpdate] - Setting to `true` will stop the transforms of the scene graph from
     *  being updated. This means the calculation returned MAY be out of date BUT will give you a
     *  nice performance boost.
     * @param {PIXI.Rectangle} [rect] - Optional rectangle to store the result of the bounds calculation.
     * @return {PIXI.Rectangle} The rectangular bounding area.
     */
    getBounds(skipUpdate?: boolean, rect?: Rectangle): Rectangle;
    /**
     * Retrieves the local bounds of the displayObject as a rectangle object.
     *
     * @param {PIXI.Rectangle} [rect] - Optional rectangle to store the result of the bounds calculation.
     * @return {PIXI.Rectangle} The rectangular bounding area.
     */
    getLocalBounds(rect?: Rectangle): Rectangle;
    /**
     * Calculates the global position of the display object.
     *
     * @param {PIXI.IPointData} position - The world origin to calculate from.
     * @param {PIXI.Point} [point] - A Point object in which to store the value, optional
     *  (otherwise will create a new Point).
     * @param {boolean} [skipUpdate=false] - Should we skip the update transform.
     * @return {PIXI.Point} A point object representing the position of this object.
     */
    toGlobal<P extends IPointData = Point>(position: IPointData, point?: P, skipUpdate?: boolean): P;
    /**
     * Calculates the local position of the display object relative to another point.
     *
     * @param {PIXI.IPointData} position - The world origin to calculate from.
     * @param {PIXI.DisplayObject} [from] - The DisplayObject to calculate the global position from.
     * @param {PIXI.Point} [point] - A Point object in which to store the value, optional
     *  (otherwise will create a new Point).
     * @param {boolean} [skipUpdate=false] - Should we skip the update transform
     * @return {PIXI.Point} A point object representing the position of this object
     */
    toLocal<P extends IPointData = Point>(position: IPointData, from: DisplayObject, point?: P, skipUpdate?: boolean): P;
    /**
     * Set the parent Container of this DisplayObject.
     *
     * @param {PIXI.Container} container - The Container to add this DisplayObject to.
     * @return {PIXI.Container} The Container that this DisplayObject was added to.
     */
    setParent(container: Container): Container;
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
    setTransform(x?: number, y?: number, scaleX?: number, scaleY?: number, rotation?: number, skewX?: number, skewY?: number, pivotX?: number, pivotY?: number): this;
    /**
     * Base destroy method for generic display objects. This will automatically
     * remove the display object from its parent Container as well as remove
     * all current event listeners and internal references. Do not use a DisplayObject
     * after calling `destroy()`.
     *
     */
    destroy(_options?: IDestroyOptions | boolean): void;
    /**
     * @protected
     * @member {PIXI.Container}
     */
    get _tempDisplayObjectParent(): TemporaryDisplayObject;
    /**
     * Used in Renderer, cacheAsBitmap and other places where you call an `updateTransform` on root
     *
     * ```
     * const cacheParent = elem.enableTempParent();
     * elem.updateTransform();
     * elem.disableTempParent(cacheParent);
     * ```
     *
     * @returns {PIXI.DisplayObject} current parent
     */
    enableTempParent(): DisplayObject;
    /**
     * Pair method for `enableTempParent`
     * @param {PIXI.DisplayObject} cacheParent actual parent of element
     */
    disableTempParent(cacheParent: DisplayObject): void;
    /**
     * The position of the displayObject on the x axis relative to the local coordinates of the parent.
     * An alias to position.x
     *
     * @member {number}
     */
    get x(): number;
    set x(value: number);
    /**
     * The position of the displayObject on the y axis relative to the local coordinates of the parent.
     * An alias to position.y
     *
     * @member {number}
     */
    get y(): number;
    set y(value: number);
    /**
     * Current transform of the object based on world (parent) factors.
     *
     * @member {PIXI.Matrix}
     * @readonly
     */
    get worldTransform(): Matrix;
    /**
     * Current transform of the object based on local factors: position, scale, other stuff.
     *
     * @member {PIXI.Matrix}
     * @readonly
     */
    get localTransform(): Matrix;
    /**
     * The coordinate of the object relative to the local coordinates of the parent.
     * Assignment by value since pixi-v4.
     *
     * @member {PIXI.ObservablePoint}
     */
    get position(): ObservablePoint;
    set position(value: ObservablePoint);
    /**
     * The scale factor of the object.
     * Assignment by value since pixi-v4.
     *
     * @member {PIXI.ObservablePoint}
     */
    get scale(): ObservablePoint;
    set scale(value: ObservablePoint);
    /**
     * The pivot point of the displayObject that it rotates around.
     * Assignment by value since pixi-v4.
     *
     * @member {PIXI.ObservablePoint}
     */
    get pivot(): ObservablePoint;
    set pivot(value: ObservablePoint);
    /**
     * The skew factor for the object in radians.
     * Assignment by value since pixi-v4.
     *
     * @member {PIXI.ObservablePoint}
     */
    get skew(): ObservablePoint;
    set skew(value: ObservablePoint);
    /**
     * The rotation of the object in radians.
     * 'rotation' and 'angle' have the same effect on a display object; rotation is in radians, angle is in degrees.
     *
     * @member {number}
     */
    get rotation(): number;
    set rotation(value: number);
    /**
     * The angle of the object in degrees.
     * 'rotation' and 'angle' have the same effect on a display object; rotation is in radians, angle is in degrees.
     *
     * @member {number}
     */
    get angle(): number;
    set angle(value: number);
    /**
     * The zIndex of the displayObject.
     * If a container has the sortableChildren property set to true, children will be automatically
     * sorted by zIndex value; a higher value will mean it will be moved towards the end of the array,
     * and thus rendered on top of other displayObjects within the same container.
     *
     * @member {number}
     */
    get zIndex(): number;
    set zIndex(value: number);
    /**
     * Indicates if the object is globally visible.
     *
     * @member {boolean}
     * @readonly
     */
    get worldVisible(): boolean;
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
     * @member {PIXI.Container|PIXI.MaskData|null}
     */
    get mask(): Container | MaskData | null;
    set mask(value: Container | MaskData | null);
}

export declare interface IDestroyOptions {
    children?: boolean;
    texture?: boolean;
    baseTexture?: boolean;
}

export declare class TemporaryDisplayObject extends DisplayObject
{
    calculateBounds: () => null;
    removeChild: (child: DisplayObject) => null;
    render: (renderer: Renderer) => null;
    sortDirty: boolean;
}

export { };
