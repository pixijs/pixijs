import utils from '../utils';
import DisplayObject from './DisplayObject';

/**
 * A Container represents a collection of display objects.
 * It is the base class of all display objects that act as a container for other objects.
 *
 *```js
 * let container = new PIXI.Container();
 * container.addChild(sprite);
 * ```
 * @class
 * @extends PIXI.DisplayObject
 * @memberof PIXI
 */
class Container extends DisplayObject
{
    constructor()
    {
        super();

        /**
         * The array of children of this container.
         *
         * @member {PIXI.DisplayObject[]}
         * @readonly
         */
        this.children = [];
    }

    /**
     * Overridable method that can be used by Container subclasses whenever the children array is modified
     *
     * @private
     */
    onChildrenChange() {}

    /**
     * Adds a child or multiple children to the container.
     *
     * Multple items can be added like so: `myContainer.addChild(thinkOne, thingTwo, thingThree)`
     * @param child {...PIXI.DisplayObject} The DisplayObject(s) to add to the container
     * @return {PIXI.DisplayObject} The first child that was added.
     */
    addChild(child)
    {
        const argumentsLength = arguments.length;

        // if there is only one argument we can bypass looping through the them
        if(argumentsLength > 1)
        {
            // loop through the arguments property and add all children
            // use it the right way (.length and [i]) so that this function can still be optimised by JS runtimes
            for (let i = 0; i < argumentsLength; i++)
            {
                this.addChild( arguments[i] );
            }
        }
        else
        {
            // if the child has a parent then lets remove it as Pixi objects can only exist in one place
            if (child.parent)
            {
                child.parent.removeChild(child);
            }

            child.parent = this;

            // ensure a transform will be recalculated..
            this.transform._parentID = -1;

            this.children.push(child);

            // TODO - lets either do all callbacks or all events.. not both!
            this.onChildrenChange(this.children.length-1);
            child.emit('added', this);
        }

        return child;
    }

    /**
     * Adds a child to the container at a specified index. If the index is out of bounds an error will be thrown
     *
     * @param child {PIXI.DisplayObject} The child to add
     * @param index {number} The index to place the child in
     * @return {PIXI.DisplayObject} The child that was added.
     */
    addChildAt(child, index)
    {
        if (index >= 0 && index <= this.children.length)
        {
            if (child.parent)
            {
                child.parent.removeChild(child);
            }

            child.parent = this;

            this.children.splice(index, 0, child);

            // TODO - lets either do all callbacks or all events.. not both!
            this.onChildrenChange(index);
            child.emit('added', this);

            return child;
        }
        else
        {
            throw new Error(child + 'addChildAt: The index '+ index +' supplied is out of bounds ' + this.children.length);
        }
    }

    /**
     * Swaps the position of 2 Display Objects within this container.
     *
     * @param child {PIXI.DisplayObject} First display object to swap
     * @param child2 {PIXI.DisplayObject} Second display object to swap
     */
    swapChildren(child, child2)
    {
        if (child === child2)
        {
            return;
        }

        const index1 = this.getChildIndex(child);
        const index2 = this.getChildIndex(child2);

        if (index1 < 0 || index2 < 0)
        {
            throw new Error('swapChildren: Both the supplied DisplayObjects must be children of the caller.');
        }

        this.children[index1] = child2;
        this.children[index2] = child;
        this.onChildrenChange(index1 < index2 ? index1 : index2);
    }

    /**
     * Returns the index position of a child DisplayObject instance
     *
     * @param child {PIXI.DisplayObject} The DisplayObject instance to identify
     * @return {number} The index position of the child display object to identify
     */
    getChildIndex(child)
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
     * @param child {PIXI.DisplayObject} The child DisplayObject instance for which you want to change the index number
     * @param index {number} The resulting index number for the child display object
     */
    setChildIndex(child, index)
    {
        if (index < 0 || index >= this.children.length)
        {
            throw new Error('The supplied index is out of bounds');
        }

        const currentIndex = this.getChildIndex(child);

        utils.removeItems(this.children, currentIndex, 1); // remove from old position
        this.children.splice(index, 0, child); //add at new position
        this.onChildrenChange(index);
    }

    /**
     * Returns the child at the specified index
     *
     * @param index {number} The index to get the child at
     * @return {PIXI.DisplayObject} The child at the given index, if any.
     */
    getChildAt(index)
    {
        if (index < 0 || index >= this.children.length)
        {
            throw new Error('getChildAt: Supplied index ' + index + ' does not exist in the child list, or the supplied DisplayObject is not a child of the caller');
        }

        return this.children[index];
    }

    /**
     * Removes a child from the container.
     *
     * @param child {PIXI.DisplayObject} The DisplayObject to remove
     * @return {PIXI.DisplayObject} The child that was removed.
     */
    removeChild(child)
    {
        const argumentsLength = arguments.length;

        // if there is only one argument we can bypass looping through the them
        if(argumentsLength > 1)
        {
            // loop through the arguments property and add all children
            // use it the right way (.length and [i]) so that this function can still be optimised by JS runtimes
            for (let i = 0; i < argumentsLength; i++)
            {
                this.removeChild( arguments[i] );
            }
        }
        else
        {
            let index = this.children.indexOf(child);

            if (index === -1)
            {
                return;
            }

            child.parent = null;
            utils.removeItems(this.children, index, 1);

            // TODO - lets either do all callbacks or all events.. not both!
            this.onChildrenChange(index);
            child.emit('removed', this);
        }

        return child;
    }

    /**
     * Removes a child from the specified index position.
     *
     * @param index {number} The index to get the child from
     * @return {PIXI.DisplayObject} The child that was removed.
     */
    removeChildAt(index)
    {
        const child = this.getChildAt(index);

        child.parent = null;
        utils.removeItems(this.children, index, 1);

        // TODO - lets either do all callbacks or all events.. not both!
        this.onChildrenChange(index);
        child.emit('removed', this);

        return child;
    }

    /**
     * Removes all children from this container that are within the begin and end indexes.
     *
     * @param [beginIndex=0] {number} The beginning position.
     * @param [endIndex=this.children.length] {number} The ending position. Default value is size of the container.
     */
    removeChildren(beginIndex=0, endIndex)
    {
        const begin = beginIndex;
        const end = typeof endIndex === 'number' ? endIndex : this.children.length;
        const range = end - begin;
        let removed;

        if (range > 0 && range <= end)
        {
            removed = this.children.splice(begin, range);

            for (let i = 0; i < removed.length; ++i)
            {
                removed[i].parent = null;
            }

            this.onChildrenChange(beginIndex);

            for (let i = 0; i < removed.length; ++i)
            {
                removed[i].emit('removed', this);
            }

            return removed;
        }
        else if (range === 0 && this.children.length === 0)
        {
            return [];
        }
        else
        {
            throw new RangeError('removeChildren: numeric values are outside the acceptable range.');
        }
    }

    /*
     * Updates the transform on all children of this container for rendering
     *
     * @private
     */
    updateTransform()
    {
        this._boundsID++;

        this.transform.updateTransform(this.parent.transform);

        //TODO: check render flags, how to process stuff here
        this.worldAlpha = this.alpha * this.parent.worldAlpha;

        for (let i = 0, j = this.children.length; i < j; ++i)
        {
            var child = this.children[i];
            if (child.visible)
            {
                child.updateTransform();
            }
        }
    }

    calculateBounds()
    {
        this._bounds.clear();

        this._calculateBounds();

        for (let i = 0; i < this.children.length; i++)
        {
            const child = this.children[i];

            if (!child.visible || !child.renderable) {
                continue;
            }

            child.calculateBounds();

            //TODO: filter+mask, need to mask both somehow
            if (child._mask)
            {
                child._mask.calculateBounds();
                this._bounds.addBoundsMask(child._bounds, child._mask._bounds);
            } else if (child.filterArea)
            {
                this._bounds.addBoundsArea(child._bounds, child.filterArea);
            } else
            {
                this._bounds.addBounds(child._bounds);
            }
        }

        this._lastBoundsID = this._boundsID;
    }

    _calculateBounds()
    {
        //FILL IN//
    }

    /**
     * Renders the object using the WebGL renderer
     *
     * @param renderer {PIXI.WebGLRenderer} The renderer
     */
    renderWebGL(renderer)
    {

        // if the object is not visible or the alpha is 0 then no need to render this element
        if (!this.visible || this.worldAlpha <= 0 || !this.renderable)
        {

            return;
        }


        // do a quick check to see if this element has a mask or a filter.
        if (this._mask || this._filters)
        {
            this.renderAdvancedWebGL(renderer);
        }
        else
        {
            this._renderWebGL(renderer);

            // simple render children!
            for (let i = 0, j = this.children.length; i < j; ++i)
            {
                this.children[i].renderWebGL(renderer);
            }
        }
    }

    renderAdvancedWebGL(renderer)
    {
        renderer.currentRenderer.flush();

        const filters = this._filters;
        const mask = this._mask;

        // push filter first as we need to ensure the stencil buffer is correct for any masking
        if ( filters )
        {
            if(!this._enabledFilters)
            {
                this._enabledFilters = [];
            }

            this._enabledFilters.length = 0;

            for (let i = 0; i < filters.length; i++)
            {
                if(filters[i].enabled)
                {
                    this._enabledFilters.push( filters[i] );
                }
            }

            if( this._enabledFilters.length )
            {
                renderer.filterManager.pushFilter(this, this._enabledFilters);
            }
        }

        if ( mask )
        {
            renderer.maskManager.pushMask(this, this._mask);
        }

        renderer.currentRenderer.start();

        // add this object to the batch, only rendered if it has a texture.
        this._renderWebGL(renderer);

        // now loop through the children and make sure they get rendered
        for (let i = 0, j = this.children.length; i < j; i++)
        {
            this.children[i].renderWebGL(renderer);
        }

        renderer.currentRenderer.flush();

        if ( mask )
        {
            renderer.maskManager.popMask(this, this._mask);
        }

        if ( filters && this._enabledFilters && this._enabledFilters.length )
        {
            renderer.filterManager.popFilter();
        }

        renderer.currentRenderer.start();
    }

    /**
     * To be overridden by the subclass
     *
     * @param renderer {PIXI.WebGLRenderer} The renderer
     * @private
     */
    _renderWebGL(renderer) // eslint-disable-line no-unused-vars
    {
        // this is where content itself gets rendered...
    }

    /**
     * To be overridden by the subclass
     *
     * @param renderer {PIXI.CanvasRenderer} The renderer
     * @private
     */
    _renderCanvas(renderer) // eslint-disable-line no-unused-vars
    {
        // this is where content itself gets rendered...
    }

    /**
     * Renders the object using the Canvas renderer
     *
     * @param renderer {PIXI.CanvasRenderer} The renderer
     */
    renderCanvas(renderer)
    {
        // if not visible or the alpha is 0 then no need to render this
        if (!this.visible || this.alpha <= 0 || !this.renderable)
        {
            return;
        }

        if (this._mask)
        {
            renderer.maskManager.pushMask(this._mask);
        }

        this._renderCanvas(renderer);
        for (let i = 0, j = this.children.length; i < j; ++i)
        {
            this.children[i].renderCanvas(renderer);
        }

        if (this._mask)
        {
            renderer.maskManager.popMask(renderer);
        }
    }

    /**
     * Removes all internal references and listeners as well as removes children from the display list.
     * Do not use a Container after calling `destroy`.
     * @param [options] {object|boolean} Options parameter. A boolean will act as if all options have been set to that value
     * @param [options.children=false] {boolean} if set to true, all the children will have their destroy
     *      method called as well. 'options' will be passed on to those calls.
     */
    destroy(options)
    {
        super.destroy();

        const destroyChildren = typeof options === 'boolean' ? options : options && options.children;

        const oldChildren = this.children;
        this.children = null;

        if (destroyChildren)
        {
            for (let i = oldChildren.length - 1; i >= 0; i--)
            {
                const child = oldChildren[i];
                child.parent = null;
                child.destroy(options);
            }
        }
    }

    /**
     * The width of the Container, setting this will actually modify the scale to achieve the value set
     *
     * @member {number}
     * @memberof PIXI.Container#
     */
    get width()
    {
        return this.scale.x * this.getLocalBounds().width;
    }
    set width(value)
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

    /**
     * The height of the Container, setting this will actually modify the scale to achieve the value set
     *
     * @member {number}
     * @memberof PIXI.Container#
     */
    get height()
    {
        return  this.scale.y * this.getLocalBounds().height;
    }
    set height(value)
    {

        const height = this.getLocalBounds().height;

        if (height !== 0)
        {
            this.scale.y = value / height ;
        }
        else
        {
            this.scale.y = 1;
        }

        this._height = value;
    }
}

// performance increase to avoid using call.. (10x faster)
Container.prototype.containerUpdateTransform = Container.prototype.updateTransform;

export default Container;
