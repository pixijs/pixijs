import { settings } from '@pixi/settings';
import { removeItems } from '@pixi/utils';
import { DisplayObject } from './DisplayObject';
import { Matrix, Rectangle } from '@pixi/math';
import { MASK_TYPES } from '@pixi/constants';

import type { MaskData, Renderer } from '@pixi/core';
import type { IDestroyOptions } from './DisplayObject';

function sortChildren(a: DisplayObject, b: DisplayObject): number
{
    if (a.zIndex === b.zIndex)
    {
        return a._lastSortedIndex - b._lastSortedIndex;
    }

    return a.zIndex - b.zIndex;
}

export interface Container extends GlobalMixins.Container, DisplayObject {}

/**
 * Container is a general-purpose display object that holds children. It also adds built-in support for advanced
 * rendering features like masking and filtering.
 *
 * It is the base class of all display objects that act as a container for other objects, including Graphics
 * and Sprite.
 *
 * ```js
 * import { BlurFilter } from '@pixi/filter-blur';
 * import { Container } from '@pixi/display';
 * import { Graphics } from '@pixi/graphics';
 * import { Sprite } from '@pixi/sprite';
 *
 * let container = new Container();
 * let sprite = Sprite.from("https://s3-us-west-2.amazonaws.com/s.cdpn.io/693612/IaUrttj.png");
 *
 * sprite.width = 512;
 * sprite.height = 512;
 *
 * // Adds a sprite as a child to this container. As a result, the sprite will be rendered whenever the container
 * // is rendered.
 * container.addChild(sprite);
 *
 * // Blurs whatever is rendered by the container
 * container.filters = [new BlurFilter()];
 *
 * // Only the contents within a circle at the center should be rendered onto the screen.
 * container.mask = new Graphics()
 *  .beginFill(0xffffff)
 *  .drawCircle(sprite.width / 2, sprite.height / 2, Math.min(sprite.width, sprite.height) / 2)
 *  .endFill();
 * ```
 *
 * @memberof PIXI
 */
export class Container extends DisplayObject
{
    /**
     * The array of children of this container.
     *
     * @readonly
     */
    public readonly children: DisplayObject[];

    /**
     * If set to true, the container will sort its children by zIndex value
     * when updateTransform() is called, or manually if sortChildren() is called.
     *
     * This actually changes the order of elements in the array, so should be treated
     * as a basic solution that is not performant compared to other solutions,
     * such as @link https://github.com/pixijs/pixi-display
     *
     * Also be aware of that this may not work nicely with the addChildAt() function,
     * as the zIndex sorting may cause the child to automatically sorted to another position.
     *
     * @see PIXI.settings.SORTABLE_CHILDREN
     */
    public sortableChildren: boolean;

    /**
     * Should children be sorted by zIndex at the next updateTransform call.
     *
     * Will get automatically set to true if a new child is added, or if a child's zIndex changes.
     */
    public sortDirty: boolean;
    public parent: Container;
    public containerUpdateTransform: () => void;

    protected _width: number;
    protected _height: number;

    constructor()
    {
        super();

        this.children = [];
        this.sortableChildren = settings.SORTABLE_CHILDREN;
        this.sortDirty = false;

        /**
         * Fired when a DisplayObject is added to this Container.
         *
         * @event PIXI.Container#childAdded
         * @param {PIXI.DisplayObject} child - The child added to the Container.
         * @param {PIXI.Container} container - The container that added the child.
         * @param {number} index - The children's index of the added child.
         */

        /**
         * Fired when a DisplayObject is removed from this Container.
         *
         * @event PIXI.DisplayObject#removedFrom
         * @param {PIXI.DisplayObject} child - The child removed from the Container.
         * @param {PIXI.Container} container - The container that removed removed the child.
         * @param {number} index - The former children's index of the removed child
         */
    }

    /** Overridable method that can be used by Container subclasses whenever the children array is modified. */
    protected onChildrenChange(_length?: number): void
    {
        /* empty */
    }

    /**
     * Adds one or more children to the container.
     *
     * Multiple items can be added like so: `myContainer.addChild(thingOne, thingTwo, thingThree)`
     *
     * @param {...PIXI.DisplayObject} children - The DisplayObject(s) to add to the container
     * @return {PIXI.DisplayObject} - The first child that was added.
     */
    addChild<T extends DisplayObject[]>(...children: T): T[0]
    {
        // if there is only one argument we can bypass looping through the them
        if (children.length > 1)
        {
            // loop through the array and add all children
            for (let i = 0; i < children.length; i++)
            {
                // eslint-disable-next-line prefer-rest-params
                this.addChild(children[i]);
            }
        }
        else
        {
            const child = children[0];
            // if the child has a parent then lets remove it as PixiJS objects can only exist in one place

            if (child.parent)
            {
                child.parent.removeChild(child);
            }

            child.parent = this;
            this.sortDirty = true;

            // ensure child transform will be recalculated
            child.transform._parentID = -1;

            this.children.push(child);

            // ensure bounds will be recalculated
            this._boundsID++;

            // TODO - lets either do all callbacks or all events.. not both!
            this.onChildrenChange(this.children.length - 1);
            this.emit('childAdded', child, this, this.children.length - 1);
            child.emit('added', this);
        }

        return children[0];
    }

    /**
     * Adds a child to the container at a specified index. If the index is out of bounds an error will be thrown
     *
     * @param {PIXI.DisplayObject} child - The child to add
     * @param {number} index - The index to place the child in
     * @return {PIXI.DisplayObject} The child that was added.
     */
    addChildAt<T extends DisplayObject>(child: T, index: number): T
    {
        if (index < 0 || index > this.children.length)
        {
            throw new Error(`${child}addChildAt: The index ${index} supplied is out of bounds ${this.children.length}`);
        }

        if (child.parent)
        {
            child.parent.removeChild(child);
        }

        child.parent = this;
        this.sortDirty = true;

        // ensure child transform will be recalculated
        child.transform._parentID = -1;

        this.children.splice(index, 0, child);

        // ensure bounds will be recalculated
        this._boundsID++;

        // TODO - lets either do all callbacks or all events.. not both!
        this.onChildrenChange(index);
        child.emit('added', this);
        this.emit('childAdded', child, this, index);

        return child;
    }

    /**
     * Swaps the position of 2 Display Objects within this container.
     *
     * @param child - First display object to swap
     * @param child2 - Second display object to swap
     */
    swapChildren(child: DisplayObject, child2: DisplayObject): void
    {
        if (child === child2)
        {
            return;
        }

        const index1 = this.getChildIndex(child);
        const index2 = this.getChildIndex(child2);

        this.children[index1] = child2;
        this.children[index2] = child;
        this.onChildrenChange(index1 < index2 ? index1 : index2);
    }

    /**
     * Returns the index position of a child DisplayObject instance
     *
     * @param child - The DisplayObject instance to identify
     * @return - The index position of the child display object to identify
     */
    getChildIndex(child: DisplayObject): number
    {
        const index = this.children.indexOf(child);

        if (index === -1)
        {
            throw new Error('The supplied DisplayObject must be a child of the caller');
        }

        return index;
    }

    /**
     * Changes the position of an existing child in the display object container
     *
     * @param child - The child DisplayObject instance for which you want to change the index number
     * @param index - The resulting index number for the child display object
     */
    setChildIndex(child: DisplayObject, index: number): void
    {
        if (index < 0 || index >= this.children.length)
        {
            throw new Error(`The index ${index} supplied is out of bounds ${this.children.length}`);
        }

        const currentIndex = this.getChildIndex(child);

        removeItems(this.children, currentIndex, 1); // remove from old position
        this.children.splice(index, 0, child); // add at new position

        this.onChildrenChange(index);
    }

    /**
     * Returns the child at the specified index
     *
     * @param index - The index to get the child at
     * @return - The child at the given index, if any.
     */
    getChildAt(index: number): DisplayObject
    {
        if (index < 0 || index >= this.children.length)
        {
            throw new Error(`getChildAt: Index (${index}) does not exist.`);
        }

        return this.children[index];
    }

    /**
     * Removes one or more children from the container.
     *
     * @param {...PIXI.DisplayObject} children - The DisplayObject(s) to remove
     * @return {PIXI.DisplayObject} The first child that was removed.
     */
    removeChild<T extends DisplayObject[]>(...children: T): T[0]
    {
        // if there is only one argument we can bypass looping through the them
        if (children.length > 1)
        {
            // loop through the arguments property and remove all children
            for (let i = 0; i < children.length; i++)
            {
                this.removeChild(children[i]);
            }
        }
        else
        {
            const child = children[0];
            const index = this.children.indexOf(child);

            if (index === -1) return null;

            child.parent = null;
            // ensure child transform will be recalculated
            child.transform._parentID = -1;
            removeItems(this.children, index, 1);

            // ensure bounds will be recalculated
            this._boundsID++;

            // TODO - lets either do all callbacks or all events.. not both!
            this.onChildrenChange(index);
            child.emit('removed', this);
            this.emit('childRemoved', child, this, index);
        }

        return children[0];
    }

    /**
     * Removes a child from the specified index position.
     *
     * @param index - The index to get the child from
     * @return The child that was removed.
     */
    removeChildAt(index: number): DisplayObject
    {
        const child = this.getChildAt(index);

        // ensure child transform will be recalculated..
        child.parent = null;
        child.transform._parentID = -1;
        removeItems(this.children, index, 1);

        // ensure bounds will be recalculated
        this._boundsID++;

        // TODO - lets either do all callbacks or all events.. not both!
        this.onChildrenChange(index);
        child.emit('removed', this);
        this.emit('childRemoved', child, this, index);

        return child;
    }

    /**
     * Removes all children from this container that are within the begin and end indexes.
     *
     * @param beginIndex - The beginning position.
     * @param endIndex - The ending position. Default value is size of the container.
     * @returns - List of removed children
     */
    removeChildren(beginIndex = 0, endIndex = this.children.length): DisplayObject[]
    {
        const begin = beginIndex;
        const end = endIndex;
        const range = end - begin;
        let removed;

        if (range > 0 && range <= end)
        {
            removed = this.children.splice(begin, range);

            for (let i = 0; i < removed.length; ++i)
            {
                removed[i].parent = null;
                if (removed[i].transform)
                {
                    removed[i].transform._parentID = -1;
                }
            }

            this._boundsID++;

            this.onChildrenChange(beginIndex);

            for (let i = 0; i < removed.length; ++i)
            {
                removed[i].emit('removed', this);
                this.emit('childRemoved', removed[i], this, i);
            }

            return removed;
        }
        else if (range === 0 && this.children.length === 0)
        {
            return [];
        }

        throw new RangeError('removeChildren: numeric values are outside the acceptable range.');
    }

    /** Sorts children by zIndex. Previous order is maintained for 2 children with the same zIndex. */
    sortChildren(): void
    {
        let sortRequired = false;

        for (let i = 0, j = this.children.length; i < j; ++i)
        {
            const child = this.children[i];

            child._lastSortedIndex = i;

            if (!sortRequired && child.zIndex !== 0)
            {
                sortRequired = true;
            }
        }

        if (sortRequired && this.children.length > 1)
        {
            this.children.sort(sortChildren);
        }

        this.sortDirty = false;
    }

    /** Updates the transform on all children of this container for rendering. */
    updateTransform(): void
    {
        if (this.sortableChildren && this.sortDirty)
        {
            this.sortChildren();
        }

        this._boundsID++;

        this.transform.updateTransform(this.parent.transform);

        // TODO: check render flags, how to process stuff here
        this.worldAlpha = this.alpha * this.parent.worldAlpha;

        for (let i = 0, j = this.children.length; i < j; ++i)
        {
            const child = this.children[i];

            if (child.visible)
            {
                child.updateTransform();
            }
        }
    }

    /**
     * Recalculates the bounds of the container.
     *
     * This implementation will automatically fit the children's bounds into the calculation. Each child's bounds
     * is limited to its mask's bounds or filterArea, if any is applied.
     */
    calculateBounds(): void
    {
        this._bounds.clear();

        this._calculateBounds();

        for (let i = 0; i < this.children.length; i++)
        {
            const child = this.children[i];

            if (!child.visible || !child.renderable)
            {
                continue;
            }

            child.calculateBounds();

            // TODO: filter+mask, need to mask both somehow
            if (child._mask)
            {
                const maskObject = ((child._mask as MaskData).maskObject || child._mask) as Container;

                maskObject.calculateBounds();
                this._bounds.addBoundsMask(child._bounds, maskObject._bounds);
            }
            else if (child.filterArea)
            {
                this._bounds.addBoundsArea(child._bounds, child.filterArea);
            }
            else
            {
                this._bounds.addBounds(child._bounds);
            }
        }

        this._bounds.updateID = this._boundsID;
    }

    /**
     * Retrieves the local bounds of the displayObject as a rectangle object.
     *
     * Calling `getLocalBounds` may invalidate the `_bounds` of the whole subtree below. If using it inside a render()
     * call, it is advised to call `getBounds()` immediately after to recalculate the world bounds of the subtree.
     *
     * @param rect - Optional rectangle to store the result of the bounds calculation.
     * @param skipChildrenUpdate - Setting to `true` will stop re-calculation of children transforms,
     *  it was default behaviour of pixi 4.0-5.2 and caused many problems to users.
     * @return - The rectangular bounding area.
     */
    public getLocalBounds(rect?: Rectangle, skipChildrenUpdate = false): Rectangle
    {
        const result = super.getLocalBounds(rect);

        if (!skipChildrenUpdate)
        {
            for (let i = 0, j = this.children.length; i < j; ++i)
            {
                const child = this.children[i];

                if (child.visible)
                {
                    child.updateTransform();
                }
            }
        }

        return result;
    }

    /**
     * Recalculates the content bounds of this object. This should be overriden to
     * calculate the bounds of this specific object (not including children).
     *
     * @protected
     */
    protected _calculateBounds(): void
    {
        // FILL IN//
    }

    /**
     * Renders this object and its children with culling.
     *
     * @protected
     * @param {PIXI.Renderer} renderer - The renderer
     */
    protected _renderWithCulling(renderer: Renderer): void
    {
        const sourceFrame = renderer.renderTexture.sourceFrame;

        // If the source frame is empty, stop rendering.
        if (!(sourceFrame.width > 0 && sourceFrame.height > 0))
        {
            return;
        }

        // Render the content of the container only if its bounds intersect with the source frame.
        // All filters are on the stack at this point, and the filter source frame is bound:
        // therefore, even if the bounds to non intersect the filter frame, the filter
        // is still applied and any filter padding that is in the frame is rendered correctly.

        let bounds: Rectangle;
        let transform: Matrix;

        // If cullArea is set, we use this rectangle instead of the bounds of the object. The cullArea
        // rectangle must completely contain the container and its children including filter padding.
        if (this.cullArea)
        {
            bounds = this.cullArea;
            transform = this.worldTransform;
        }
        // If the container doesn't override _render, we can skip the bounds calculation and intersection test.
        else if (this._render !== Container.prototype._render)
        {
            bounds = this.getBounds(true);
        }

        // Render the container if the source frame intersects the bounds.
        if (bounds && sourceFrame.intersects(bounds, transform))
        {
            this._render(renderer);
        }
        // If the bounds are defined by cullArea and do not intersect with the source frame, stop rendering.
        else if (this.cullArea)
        {
            return;
        }

        // Unless cullArea is set, we cannot skip the children if the bounds of the container do not intersect
        // the source frame, because the children might have filters with nonzero padding, which may intersect
        // with the source frame while the bounds do not: filter padding is not included in the bounds.

        // If cullArea is not set, render the children with culling temporarily enabled so that they are not rendered
        // if they are out of frame; otherwise, render the children normally.
        for (let i = 0, j = this.children.length; i < j; ++i)
        {
            const child = this.children[i];
            const childCullable = child.cullable;

            child.cullable = childCullable || !this.cullArea;
            child.render(renderer);
            child.cullable = childCullable;
        }
    }

    /**
     * Renders the object using the WebGL renderer.
     *
     * The [_render]{@link PIXI.Container#_render} method is be overriden for rendering the contents of the
     * container itself. This `render` method will invoke it, and also invoke the `render` methods of all
     * children afterward.
     *
     * If `renderable` or `visible` is false or if `worldAlpha` is not positive or if `cullable` is true and
     * the bounds of this object are out of frame, this implementation will entirely skip rendering.
     * See {@link PIXI.DisplayObject} for choosing between `renderable` or `visible`. Generally,
     * setting alpha to zero is not recommended for purely skipping rendering.
     *
     * When your scene becomes large (especially when it is larger than can be viewed in a single screen), it is
     * advised to employ **culling** to automatically skip rendering objects outside of the current screen.
     * See [cullable]{@link PIXI.DisplayObject#cullable} and [cullArea]{@link PIXI.DisplayObject#cullArea}.
     * Other culling methods might be better suited for a large number static objects; see
     * [@pixi-essentials/cull]{@link https://www.npmjs.com/package/@pixi-essentials/cull} and
     * [pixi-cull]{@link https://www.npmjs.com/package/pixi-cull}.
     *
     * The [renderAdvanced]{@link PIXI.Container#renderAdvanced} method is internally used when when masking or
     * filtering is applied on a container. This does, however, break batching and can affect performance when
     * masking and filtering is applied extensively throughout the scene graph.
     *
     * @param renderer - The renderer
     */
    render(renderer: Renderer): void
    {
        // if the object is not visible or the alpha is 0 then no need to render this element
        if (!this.visible || this.worldAlpha <= 0 || !this.renderable)
        {
            return;
        }

        // do a quick check to see if this element has a mask or a filter.
        if (this._mask || (this.filters && this.filters.length))
        {
            this.renderAdvanced(renderer);
        }
        else if (this.cullable)
        {
            this._renderWithCulling(renderer);
        }
        else
        {
            this._render(renderer);

            for (let i = 0, j = this.children.length; i < j; ++i)
            {
                this.children[i].render(renderer);
            }
        }
    }

    /**
     * Render the object using the WebGL renderer and advanced features.
     *
     * @param renderer - The renderer
     */
    protected renderAdvanced(renderer: Renderer): void
    {
        const filters = this.filters;
        const mask = this._mask as MaskData;

        // push filter first as we need to ensure the stencil buffer is correct for any masking
        if (filters)
        {
            if (!this._enabledFilters)
            {
                this._enabledFilters = [];
            }

            this._enabledFilters.length = 0;

            for (let i = 0; i < filters.length; i++)
            {
                if (filters[i].enabled)
                {
                    this._enabledFilters.push(filters[i]);
                }
            }
        }

        const flush = (filters && this._enabledFilters && this._enabledFilters.length)
            || (mask && (!mask.isMaskData
                || (mask.enabled && (mask.autoDetect || mask.type !== MASK_TYPES.NONE))));

        if (flush)
        {
            renderer.batch.flush();
        }

        if (filters && this._enabledFilters && this._enabledFilters.length)
        {
            renderer.filter.push(this, this._enabledFilters);
        }

        if (mask)
        {
            renderer.mask.push(this, this._mask);
        }

        if (this.cullable)
        {
            this._renderWithCulling(renderer);
        }
        else
        {
            this._render(renderer);

            for (let i = 0, j = this.children.length; i < j; ++i)
            {
                this.children[i].render(renderer);
            }
        }

        if (flush)
        {
            renderer.batch.flush();
        }

        if (mask)
        {
            renderer.mask.pop(this);
        }

        if (filters && this._enabledFilters && this._enabledFilters.length)
        {
            renderer.filter.pop();
        }
    }

    /**
     * To be overridden by the subclasses.
     *
     * @param renderer - The renderer
     */
    protected _render(_renderer: Renderer): void // eslint-disable-line no-unused-vars
    {
        // this is where content itself gets rendered...
    }

    /**
     * Removes all internal references and listeners as well as removes children from the display list.
     * Do not use a Container after calling `destroy`.
     *
     * @param options - Options parameter. A boolean will act as if all options
     *  have been set to that value
     * @param {boolean} [options.children=false] - if set to true, all the children will have their destroy
     *  method called as well. 'options' will be passed on to those calls.
     * @param {boolean} [options.texture=false] - Only used for child Sprites if options.children is set to true
     *  Should it destroy the texture of the child sprite
     * @param {boolean} [options.baseTexture=false] - Only used for child Sprites if options.children is set to true
     *  Should it destroy the base texture of the child sprite
     */
    destroy(options?: IDestroyOptions|boolean): void
    {
        super.destroy();

        this.sortDirty = false;

        const destroyChildren = typeof options === 'boolean' ? options : options && options.children;

        const oldChildren = this.removeChildren(0, this.children.length);

        if (destroyChildren)
        {
            for (let i = 0; i < oldChildren.length; ++i)
            {
                oldChildren[i].destroy(options);
            }
        }
    }

    /** The width of the Container, setting this will actually modify the scale to achieve the value set. */
    get width(): number
    {
        return this.scale.x * this.getLocalBounds().width;
    }

    set width(value: number)
    {
        const width = this.getLocalBounds().width;

        if (width !== 0)
        {
            this.scale.x = value / width;
        }
        else
        {
            this.scale.x = 1;
        }

        this._width = value;
    }

    /** The height of the Container, setting this will actually modify the scale to achieve the value set. */
    get height(): number
    {
        return this.scale.y * this.getLocalBounds().height;
    }

    set height(value: number)
    {
        const height = this.getLocalBounds().height;

        if (height !== 0)
        {
            this.scale.y = value / height;
        }
        else
        {
            this.scale.y = 1;
        }

        this._height = value;
    }
}

/**
 * Container default updateTransform, does update children of container.
 * Will crash if there's no parent element.
 *
 * @memberof PIXI.Container#
 * @method containerUpdateTransform
 */
Container.prototype.containerUpdateTransform = Container.prototype.updateTransform;
