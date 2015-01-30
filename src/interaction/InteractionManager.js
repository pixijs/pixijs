var core = require('../core'),
    InteractionData = require('./InteractionData');

/**
 * The interaction manager deals with mouse and touch events. Any DisplayObject can be interactive
 * if its interactive parameter is set to true
 * This manager also supports multitouch.
 *
 * @class
 * @namespace PIXI
 * @param stage {Container} The container to handle interactions
 */
function InteractionManager(stage, renderer)
{
    /**
     * @member {boolean}
     * @default
     */
    this.autoPreventDefault = true;

    /**
     * A reference to the stage
     *
     * @member {Container}
     */
    this.stage = stage;

        /**
     * A reference to what the mouse is over
     *
     * @member {Container}
     */
    this.over = null;

        /**
     * A reference to what the mouse is down over
     *
     * @member {Container}
     */
    this.down = null;

    /**
     * The mouse data
     *
     * @member {InteractionData}
     */
    this.mouse = new InteractionData();

    /**
     * An object that stores current touches (InteractionData) by id reference
     *
     * @member {object}
     */
    this.touches = {};

    /**
     * @member {Point}
     * @private
     */
    this.tempPoint = new core.math.Point();

    /**
     * @member {boolean}
     * @default
     */
    this.mouseoverEnabled = true;

    /**
     * Tiny little interactiveData pool !
     *
     * @member {Array}
     */
    this.pool = [];

    /**
     * The DOM element to bind to.
     *
     * @member {HTMLElement}
     * @private
     */
    this.interactionDOMElement = null;

    /**
     * Have events been attached to the dom element?
     *
     * @member {boolean}
     * @private
     */
    this.eventsAdded = false;

    //this will make it so that you don't have to call bind all the time

    /**
     * @member {Function}
     */
    this.onMouseMove = this.onMouseMove.bind(this);

    /**
     * @member {Function}
     */
    this.onMouseDown = this.onMouseDown.bind(this);

    /**
     * @member {Function}
     */
    this.onMouseOut = this.onMouseOut.bind(this);

    /**
     * @member {Function}
     */
    this.onMouseUp = this.onMouseUp.bind(this);

    /**
     * @member {Function}
     */
    this.onTouchStart = this.onTouchStart.bind(this);

    /**
     * @member {Function}
     */
    this.onTouchEnd = this.onTouchEnd.bind(this);

    /**
     * @member {Function}
     */
    this.onTouchMove = this.onTouchMove.bind(this);

    /**
     * @member {number}
     */
    this.resolution = 1;

    // used for hit testing
    this._tempPoint = new core.math.Point();

    if (renderer)
    {
        this.setTargetElement(renderer.view);
    }
}

InteractionManager.prototype.constructor = InteractionManager;
module.exports = InteractionManager;

/**
 * Collects an interactive sprite recursively to have their interactions managed
 *
 * @param displayObject {DisplayObject} the displayObject to collect
 * @param iParent {DisplayObject} the display object's parent
 * @private
 */
InteractionManager.prototype.visitChildren = function (visitFunc, displayObject)
{
    var children = (displayObject || this.stage).children;
    var length = children.length;

    for (var i = length - 1; i >= 0; i--)
    {
        var child = children[i];
        if (child.children.length > 0 && child.interactiveChildren !== false)
        {
            var ret = this.visitChildren(visitFunc, child);
            if (ret)
            {
                return ret;
            }
        }
        if (child.interactive)
        {
            var vret = visitFunc.call(this, child);
            if (vret)
            {
                return vret;
            }
        }
    }
};

/**
 * Sets the DOM element which will receive mouse/touch events. This is useful for when you have
 * other DOM elements on top of the renderers Canvas element. With this you'll be bale to deletegate
 * another DOM element to receive those events.
 *
 * @param element {HTMLElement} the DOM element which will receive mouse and touch events.
 * @param [resolution=1] {number} THe resolution of the new element (relative to the canvas).
 * @private
 */
InteractionManager.prototype.setTargetElement = function (element, resolution)
{
    this.removeEvents();

    this.interactionDOMElement = element;

    this.resolution = resolution || 1;

    this.addEvents();
};

/**
 *
 * @private
 */
InteractionManager.prototype.addEvents = function ()
{
    if (!this.interactionDOMElement)
    {
        return;
    }

    if (window.navigator.msPointerEnabled)
    {
        this.interactionDOMElement.style['-ms-content-zooming'] = 'none';
        this.interactionDOMElement.style['-ms-touch-action'] = 'none';
    }

    this.interactionDOMElement.addEventListener('mousemove',    this.onMouseMove,  true);
    this.interactionDOMElement.addEventListener('mousedown',    this.onMouseDown,  true);
    this.interactionDOMElement.addEventListener('mouseout',     this.onMouseOut,   true);

    this.interactionDOMElement.addEventListener('touchstart',   this.onTouchStart, true);
    this.interactionDOMElement.addEventListener('touchend',     this.onTouchEnd,   true);
    this.interactionDOMElement.addEventListener('touchmove',    this.onTouchMove,  true);

    window.addEventListener('mouseup', this.onMouseUp, true);

    this.eventsAdded = true;
};

/**
 *
 * @private
 */
InteractionManager.prototype.removeEvents = function ()
{
    if (!this.interactionDOMElement)
    {
        return;
    }

    if (window.navigator.msPointerEnabled)
    {
        this.interactionDOMElement.style['-ms-content-zooming'] = '';
        this.interactionDOMElement.style['-ms-touch-action'] = '';
    }

    this.interactionDOMElement.removeEventListener('mousemove', this.onMouseMove, true);
    this.interactionDOMElement.removeEventListener('mousedown', this.onMouseDown, true);
    this.interactionDOMElement.removeEventListener('mouseout',  this.onMouseOut, true);

    this.interactionDOMElement.removeEventListener('touchstart', this.onTouchStart, true);
    this.interactionDOMElement.removeEventListener('touchend',  this.onTouchEnd, true);
    this.interactionDOMElement.removeEventListener('touchmove', this.onTouchMove, true);

    this.interactionDOMElement = null;

    window.removeEventListener('mouseup',  this.onMouseUp, true);

    this.eventsAdded = false;
};

/**
 * Is called when the mouse moves across the renderer element
 *
 * @param event {Event} The DOM event of the mouse moving
 * @private
 */
InteractionManager.prototype.onMouseMove = function (event)
{
    this.mouse.originalEvent = event;

    // TODO optimize by not check EVERY TIME! maybe half as often? //
    var rect = this.interactionDOMElement.getBoundingClientRect();

    this.mouse.global.x = (event.clientX - rect.left) * (this.interactionDOMElement.width / rect.width) / this.resolution;
    this.mouse.global.y = (event.clientY - rect.top) * ( this.interactionDOMElement.height / rect.height) / this.resolution;

    var cursor = 'inherit';
    var over = null;
    this.visitChildren(function(item){
        if (item.mousemove)
        {
            item.mousemove(this.mouse);
        }
        if (!over && (item.mouseover || item.mouseout || item.buttonMode) && this.hitTest(item, this.mouse))
        {
            if (item.buttonMode)
            {
                cursor = item.defaultCursor;
            }
            over = item;
        }
    });
    if (over !== this.over)
    {
        if (this.over && this.over.mouseout)
        {
            this.over.mouseout(this.mouse);
        }
        this.over = over;
        if (this.over && this.over.mouseover)
        {
            this.over.mouseover(this.mouse);
        }
    }

    if (this.interactionDOMElement.style.cursor !== cursor)
    {
        this.interactionDOMElement.style.cursor = cursor;
    }
};

/**
 * Is called when the mouse button is pressed down on the renderer element
 *
 * @param event {Event} The DOM event of a mouse button being pressed down
 * @private
 */
InteractionManager.prototype.onMouseDown = function (event)
{
    this.mouse.originalEvent = event;

    if (this.autoPreventDefault)
    {
        this.mouse.originalEvent.preventDefault();
    }

    var e = this.mouse.originalEvent;
    var isRightButton = e.button === 2 || e.which === 3;
    var downFunction = isRightButton ? 'rightdown' : 'mousedown';
    var clickFunction = isRightButton ? 'rightclick' : 'click';
    var upOutsideFunction = isRightButton ? 'rightupoutside' : 'mouseupoutside';

    this.visitChildren(function(item){
        if (item[downFunction] || item[clickFunction] || item[upOutsideFunction])
        {
            var hit = this.hitTest(item, this.mouse);

            if (hit)
            {
                //call the function!
                if (item[downFunction])
                {
                    item[downFunction](this.mouse);
                }
                this.down = item;
                return true;
            }
        }
    });
};

/**
 * Is called when the mouse is moved out of the renderer element
 *
 * @param event {Event} The DOM event of a mouse being moved out
 * @private
 */
InteractionManager.prototype.onMouseOut = function (event)
{
    this.mouse.originalEvent = event;

    this.interactionDOMElement.style.cursor = 'inherit';

    if (this.over)
    {
        if (this.over.mouseout)
        {
            this.over.mouseout(this.mouse);
        }
        this.over = null;
    }
};

/**
 * Is called when the mouse button is released on the renderer element
 *
 * @param event {Event} The DOM event of a mouse button being released
 * @private
 */
InteractionManager.prototype.onMouseUp = function (event)
{
    this.mouse.originalEvent = event;

    var e = this.mouse.originalEvent;
    var isRightButton = e.button === 2 || e.which === 3;

    var upFunction = isRightButton ? 'rightup' : 'mouseup';
    var clickFunction = isRightButton ? 'rightclick' : 'click';
    var upOutsideFunction = isRightButton ? 'rightupoutside' : 'mouseupoutside';

    var up = this.visitChildren(function(item){
        if (item[upFunction] || item[clickFunction] || item[upOutsideFunction])
        {
            if (this.hitTest(item, this.mouse))
            {
                if (item[upFunction])
                {
                    item[upFunction](this.mouse);
                }
                return item;
            }
        }
    });
    if (this.down)
    {
        var ev = up === this.down ? clickFunction : upOutsideFunction;
        if (this.down[ev])
        {
            this.down[ev](this.mouse);
        }
    }
    this.down = null;
};

/**
 * Tests if the current mouse coordinates hit a sprite
 *
 * @param item {DisplayObject} The displayObject to test for a hit
 * @param interactionData {InteractionData} The interactionData object to update in the case there is a hit
 * @private
 */
InteractionManager.prototype.hitTest = function (item, interactionData)
{
    var global = interactionData.global;

    if (!item.worldVisible)
    {
        return false;
    }

    // map the global point to local space.
    item.worldTransform.applyInverse(global,  this._tempPoint);

    var x = this._tempPoint.x,
        y = this._tempPoint.y,
        i;

    //a sprite or display object with a hit area defined
    if (item.hitArea && item.hitArea.contains)
    {
        return item.hitArea.contains(x, y);
    }
    // a sprite with no hitarea defined
    else if (item instanceof core.Sprite)
    {
        var width = item.texture.frame.width;
        var height = item.texture.frame.height;
        var x1 = -width * item.anchor.x;
        var y1;

        if (x > x1 && x < x1 + width)
        {
            y1 = -height * item.anchor.y;

            if (y > y1 && y < y1 + height)
            {
                // set the target property if a hit is true!
                return true;
            }
        }
    }
    else if (item instanceof core.Graphics)
    {
        var graphicsData = item.graphicsData;
        for (i = 0; i < graphicsData.length; i++)
        {
            var data = graphicsData[i];

            if (!data.fill)
            {
                continue;
            }

            // only deal with fills..
            if (data.shape)
            {
                if (data.shape.contains(x, y))
                {
                    return true;
                }
            }
        }
    }

    var length = item.children.length;

    for (i = 0; i < length; i++)
    {
        var tempItem = item.children[i];
        var hit = this.hitTest(tempItem, interactionData);
        if (hit)
        {
            return true;
        }
    }
    return false;
};

/**
 * Is called when a touch is moved across the renderer element
 *
 * @param event {Event} The DOM event of a touch moving across the renderer view
 * @private
 */
InteractionManager.prototype.onTouchMove = function (event)
{
    // TODO
    if (this.dirty)
    {
        this.rebuildInteractiveGraph();
    }

    var rect = this.interactionDOMElement.getBoundingClientRect();
    var changedTouches = event.changedTouches;
    var touchData;
    var i = 0;

    for (i = 0; i < changedTouches.length; i++)
    {
        var touchEvent = changedTouches[i];
        touchData = this.touches[touchEvent.identifier];
        touchData.originalEvent = event;

        // update the touch position
        touchData.global.x = ( (touchEvent.clientX - rect.left) * (this.interactionDOMElement.width / rect.width) ) / this.resolution;
        touchData.global.y = ( (touchEvent.clientY - rect.top)  * (this.interactionDOMElement.height / rect.height) )  / this.resolution;
        if (navigator.isCocoonJS && !rect.left && !rect.top && !event.target.style.width && !event.target.style.height)
        {
            //Support for CocoonJS fullscreen scale modes
            touchData.global.x = touchEvent.clientX;
            touchData.global.y = touchEvent.clientY;
        }

        for (var j = 0; j < this.interactiveItems.length; j++)
        {
            var item = this.interactiveItems[j];
            if (item.touchmove && item.__touchData && item.__touchData[touchEvent.identifier])
            {
                item.touchmove(touchData);
            }
        }
    }
};

/**
 * Is called when a touch is started on the renderer element
 *
 * @param event {Event} The DOM event of a touch starting on the renderer view
 * @private
 */
InteractionManager.prototype.onTouchStart = function (event)
{
    // TODO
    if (this.dirty)
    {
        this.rebuildInteractiveGraph();
    }

    var rect = this.interactionDOMElement.getBoundingClientRect();

    if (this.autoPreventDefault)
    {
        event.preventDefault();
    }

    var changedTouches = event.changedTouches;
    for (var i=0; i < changedTouches.length; i++)
    {
        var touchEvent = changedTouches[i];

        var touchData = this.pool.pop();
        if (!touchData)
        {
            touchData = new InteractionData();
        }

        touchData.originalEvent = event;

        this.touches[touchEvent.identifier] = touchData;
        touchData.global.x = ( (touchEvent.clientX - rect.left) * (this.interactionDOMElement.width / rect.width) ) / this.resolution;
        touchData.global.y = ( (touchEvent.clientY - rect.top)  * (this.interactionDOMElement.height / rect.height) ) / this.resolution;
        if (navigator.isCocoonJS && !rect.left && !rect.top && !event.target.style.width && !event.target.style.height)
        {
            //Support for CocoonJS fullscreen scale modes
            touchData.global.x = touchEvent.clientX;
            touchData.global.y = touchEvent.clientY;
        }

        var length = this.interactiveItems.length;

        for (var j = 0; j < length; j++)
        {
            var item = this.interactiveItems[j];

            if (item.touchstart || item.tap)
            {
                var hit = this.hitTest(item, touchData);

                if (hit)
                {
                    //call the function!
                    if (item.touchstart)
                    {
                        item.touchstart(touchData);
                    }

                    item.__isDown = true;
                    item.__touchData = item.__touchData || {};
                    item.__touchData[touchEvent.identifier] = touchData;

                    if (!item.interactiveChildren)
                    {
                        break;
                    }
                }
            }
        }
    }
};

/**
 * Is called when a touch is ended on the renderer element
 *
 * @param event {Event} The DOM event of a touch ending on the renderer view
 * @private
 */
InteractionManager.prototype.onTouchEnd = function (event)
{
    // TODO
    if (this.dirty)
    {
        this.rebuildInteractiveGraph();
    }

    var rect = this.interactionDOMElement.getBoundingClientRect();
    var changedTouches = event.changedTouches;

    for (var i=0; i < changedTouches.length; i++)
    {
        var touchEvent = changedTouches[i];
        var touchData = this.touches[touchEvent.identifier];
        var up = false;
        touchData.global.x = ( (touchEvent.clientX - rect.left) * (this.interactionDOMElement.width / rect.width) ) / this.resolution;
        touchData.global.y = ( (touchEvent.clientY - rect.top)  * (this.interactionDOMElement.height / rect.height) ) / this.resolution;
        if (navigator.isCocoonJS && !rect.left && !rect.top && !event.target.style.width && !event.target.style.height)
        {
            //Support for CocoonJS fullscreen scale modes
            touchData.global.x = touchEvent.clientX;
            touchData.global.y = touchEvent.clientY;
        }

        var length = this.interactiveItems.length;
        for (var j = 0; j < length; j++)
        {
            var item = this.interactiveItems[j];

            if (item.__touchData && item.__touchData[touchEvent.identifier])
            {

                // so this one WAS down...
                touchData.originalEvent = event;

                if (item.touchend || item.tap)
                {
                    var hit = this.hitTest(item, item.__touchData[touchEvent.identifier]);
                    if (hit && !up)
                    {
                        if (item.touchend)
                        {
                            item.touchend(touchData);
                        }
                        if (item.__isDown && item.tap)
                        {
                            item.tap(touchData);
                        }
                        if (!item.interactiveChildren)
                        {
                            up = true;
                        }
                    }
                    else
                    {
                        if (item.__isDown && item.touchendoutside)
                        {
                            item.touchendoutside(touchData);
                        }
                    }

                    item.__isDown = false;
                }

                item.__touchData[touchEvent.identifier] = null;
            }
        }
        // remove the touch..
        this.pool.push(touchData);
        this.touches[touchEvent.identifier] = null;
    }
};
