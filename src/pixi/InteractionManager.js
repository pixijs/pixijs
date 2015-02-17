/**
 * @author Mat Groves http://matgroves.com/ @Doormat23
 */

 /**
 * The interaction manager deals with mouse and touch events. Any DisplayObject can be interactive
 * if its interactive parameter is set to true
 * This manager also supports multitouch.
 *
 * @class InteractionManager
 * @constructor
 * @param stage {Stage} The stage to handle interactions
 */
PIXI.InteractionManager = function(stage)
{
    /**
     * A reference to the stage
     *
     * @property stage
     * @type Stage
     */
    this.stage = stage;

    /**
     * The mouse data
     *
     * @property mouse
     * @type InteractionData
     */
    this.mouse = new PIXI.InteractionData();

    /**
     * An object that stores current touches (InteractionData) by id reference
     *
     * @property touches
     * @type Object
     */
    this.touches = {};

    /**
     * @property tempPoint
     * @type Point
     * @private
     */
    this.tempPoint = new PIXI.Point();

    /**
     * @property mouseoverEnabled
     * @type Boolean
     * @default
     */
    this.mouseoverEnabled = true;

    /**
     * Tiny little interactiveData pool !
     *
     * @property pool
     * @type Array
     */
    this.pool = [];

    /**
     * An array containing all the iterative items from the our interactive tree
     * @property interactiveItems
     * @type Array
     * @private
     */
    this.interactiveItems = [];

    /**
     * Our canvas
     * @property interactionDOMElement
     * @type HTMLCanvasElement
     * @private
     */
    this.interactionDOMElement = null;

    //this will make it so that you don't have to call bind all the time

    /**
     * @property onMouseMove
     * @type Function
     */
    this.onMouseMove = this.onMouseMove.bind( this );

    /**
     * @property onMouseDown
     * @type Function
     */
    this.onMouseDown = this.onMouseDown.bind(this);

    /**
     * @property onMouseOut
     * @type Function
     */
    this.onMouseOut = this.onMouseOut.bind(this);

    /**
     * @property onMouseUp
     * @type Function
     */
    this.onMouseUp = this.onMouseUp.bind(this);

    /**
     * @property onTouchStart
     * @type Function
     */
    this.onTouchStart = this.onTouchStart.bind(this);

    /**
     * @property onTouchEnd
     * @type Function
     */
    this.onTouchEnd = this.onTouchEnd.bind(this);

    /**
     * @property onTouchCancel
     * @type Function
     */
    this.onTouchCancel = this.onTouchCancel.bind(this);

    /**
     * @property onTouchMove
     * @type Function
     */
    this.onTouchMove = this.onTouchMove.bind(this);

    /**
     * @property last
     * @type Number
     */
    this.last = 0;

    /**
     * The css style of the cursor that is being used
     * @property currentCursorStyle
     * @type String
     */
    this.currentCursorStyle = 'inherit';

    /**
     * Is set to true when the mouse is moved out of the canvas
     * @property mouseOut
     * @type Boolean
     */
    this.mouseOut = false;

    /**
     * @property resolution
     * @type Number
     */
    this.resolution = 1;

    // used for hit testing
    this._tempPoint = new PIXI.Point();
};

// constructor
PIXI.InteractionManager.prototype.constructor = PIXI.InteractionManager;

/**
 * Collects an interactive sprite recursively to have their interactions managed
 *
 * @method collectInteractiveSprite
 * @param displayObject {DisplayObject} the displayObject to collect
 * @param iParent {DisplayObject} the display object's parent
 * @private
 */
PIXI.InteractionManager.prototype.collectInteractiveSprite = function(displayObject, iParent)
{
    var children = displayObject.children;
    var length = children.length;

    // make an interaction tree... {item.__interactiveParent}
    for (var i = length - 1; i >= 0; i--)
    {
        var child = children[i];

        // push all interactive bits
        if (child._interactive)
        {
            iParent.interactiveChildren = true;
            //child.__iParent = iParent;
            this.interactiveItems.push(child);

            if (child.children.length > 0) {
                this.collectInteractiveSprite(child, child);
            }
        }
        else
        {
            child.__iParent = null;
            if (child.children.length > 0)
            {
                this.collectInteractiveSprite(child, iParent);
            }
        }

    }
};

/**
 * Sets the target for event delegation
 *
 * @method setTarget
 * @param target {WebGLRenderer|CanvasRenderer} the renderer to bind events to
 * @private
 */
PIXI.InteractionManager.prototype.setTarget = function(target)
{
    this.target = target;
    this.resolution = target.resolution;

    // Check if the dom element has been set. If it has don't do anything.
    if (this.interactionDOMElement !== null) return;

    this.setTargetDomElement (target.view);
};

/**
 * Sets the DOM element which will receive mouse/touch events. This is useful for when you have other DOM
 * elements on top of the renderers Canvas element. With this you'll be able to delegate another DOM element
 * to receive those events
 *
 * @method setTargetDomElement
 * @param domElement {DOMElement} the DOM element which will receive mouse and touch events
 * @private
 */
PIXI.InteractionManager.prototype.setTargetDomElement = function(domElement)
{
    this.removeEvents();

    if (window.navigator.msPointerEnabled)
    {
        // time to remove some of that zoom in ja..
        domElement.style['-ms-content-zooming'] = 'none';
        domElement.style['-ms-touch-action'] = 'none';
    }

    this.interactionDOMElement = domElement;

    domElement.addEventListener('mousemove',  this.onMouseMove, true);
    domElement.addEventListener('mousedown',  this.onMouseDown, true);
    domElement.addEventListener('mouseout',   this.onMouseOut, true);

    // aint no multi touch just yet!
    domElement.addEventListener('touchstart', this.onTouchStart, true);
    domElement.addEventListener('touchend', this.onTouchEnd, true);
    domElement.addEventListener('touchleave', this.onTouchCancel, true);
    domElement.addEventListener('touchcancel', this.onTouchCancel, true);
    domElement.addEventListener('touchmove', this.onTouchMove, true);

    window.addEventListener('mouseup',  this.onMouseUp, true);
};

/**
 * @method removeEvents
 * @private
 */
PIXI.InteractionManager.prototype.removeEvents = function()
{
    if (!this.interactionDOMElement) return;

    this.interactionDOMElement.style['-ms-content-zooming'] = '';
    this.interactionDOMElement.style['-ms-touch-action'] = '';

    this.interactionDOMElement.removeEventListener('mousemove',  this.onMouseMove, true);
    this.interactionDOMElement.removeEventListener('mousedown',  this.onMouseDown, true);
    this.interactionDOMElement.removeEventListener('mouseout',   this.onMouseOut, true);

    // aint no multi touch just yet!
    this.interactionDOMElement.removeEventListener('touchstart', this.onTouchStart, true);
    this.interactionDOMElement.removeEventListener('touchend', this.onTouchEnd, true);
    this.interactionDOMElement.removeEventListener('touchleave', this.onTouchCancel, true);
    this.interactionDOMElement.removeEventListener('touchcancel', this.onTouchCancel, true);
    this.interactionDOMElement.removeEventListener('touchmove', this.onTouchMove, true);

    this.interactionDOMElement = null;

    window.removeEventListener('mouseup',  this.onMouseUp, true);
};

/**
 * updates the state of interactive objects
 *
 * @method update
 * @private
 */
PIXI.InteractionManager.prototype.update = function()
{
    if (!this.target) return;

    // frequency of 30fps??
    var now = Date.now();
    var diff = now - this.last;
    diff = (diff * PIXI.INTERACTION_FREQUENCY ) / 1000;
    if (diff < 1) return;
    this.last = now;

    var i = 0;

    // ok.. so mouse events??
    // yes for now :)
    // OPTIMISE - how often to check??
    if (this.dirty)
    {
        this.rebuildInteractiveGraph();
    }

    // loop through interactive objects!
    var length = this.interactiveItems.length;
    var cursor = 'inherit';
    var over = false;

    for (i = 0; i < length; i++)
    {
        var item = this.interactiveItems[i];

        // OPTIMISATION - only calculate every time if the mousemove function exists..
        // OK so.. does the object have any other interactive functions?
        // hit-test the clip!
       // if (item.mouseover || item.mouseout || item.buttonMode)
       // {
        // ok so there are some functions so lets hit test it..
        item.__hit = this.hitTest(item, this.mouse);
        this.mouse.target = item;
        // ok so deal with interactions..
        // looks like there was a hit!
        if (item.__hit && !over)
        {
            if (item.buttonMode) cursor = item.defaultCursor;

            if (!item.interactiveChildren)
            {
                over = true;
            }

            if (!item.__isOver)
            {
                if (item.mouseover)
                {
                    item.mouseover (this.mouse);
                }
                item.__isOver = true;
            }
        }
        else
        {
            if (item.__isOver)
            {
                // roll out!
                if (item.mouseout)
                {
                    item.mouseout (this.mouse);
                }
                item.__isOver = false;
            }
        }
    }

    if (this.currentCursorStyle !== cursor)
    {
        this.currentCursorStyle = cursor;
        this.interactionDOMElement.style.cursor = cursor;
    }
};

/**
 * @method rebuildInteractiveGraph
 * @private
 */
PIXI.InteractionManager.prototype.rebuildInteractiveGraph = function()
{
    this.dirty = false;

    var len = this.interactiveItems.length;

    for (var i = 0; i < len; i++) {
        this.interactiveItems[i].interactiveChildren = false;
    }

    this.interactiveItems = [];

    if (this.stage.interactive)
    {
        this.interactiveItems.push(this.stage);
    }

    // Go through and collect all the objects that are interactive..
    this.collectInteractiveSprite(this.stage, this.stage);
};

/**
 * Is called when the mouse moves across the renderer element
 *
 * @method onMouseMove
 * @param event {Event} The DOM event of the mouse moving
 * @private
 */
PIXI.InteractionManager.prototype.onMouseMove = function(event)
{
    if (this.dirty)
    {
        this.rebuildInteractiveGraph();
    }

    this.mouse.originalEvent = event;

    // TODO optimize by not check EVERY TIME! maybe half as often? //
    var rect = this.interactionDOMElement.getBoundingClientRect();

    this.mouse.global.x = (event.clientX - rect.left) * (this.target.width / rect.width) / this.resolution;
    this.mouse.global.y = (event.clientY - rect.top) * ( this.target.height / rect.height) / this.resolution;

    var length = this.interactiveItems.length;

    for (var i = 0; i < length; i++)
    {
        var item = this.interactiveItems[i];

        // Call the function!
        if (item.mousemove)
        {
            item.mousemove(this.mouse);
        }
    }
};

/**
 * Is called when the mouse button is pressed down on the renderer element
 *
 * @method onMouseDown
 * @param event {Event} The DOM event of a mouse button being pressed down
 * @private
 */
PIXI.InteractionManager.prototype.onMouseDown = function(event)
{
    if (this.dirty)
    {
        this.rebuildInteractiveGraph();
    }

    this.mouse.originalEvent = event;

    if (PIXI.AUTO_PREVENT_DEFAULT)
    {
        this.mouse.originalEvent.preventDefault();
    }

    // loop through interaction tree...
    // hit test each item! ->
    // get interactive items under point??
    //stage.__i
    var length = this.interactiveItems.length;

    var e = this.mouse.originalEvent;
    var isRightButton = e.button === 2 || e.which === 3;
    var downFunction = isRightButton ? 'rightdown' : 'mousedown';
    var clickFunction = isRightButton ? 'rightclick' : 'click';
    var buttonIsDown = isRightButton ? '__rightIsDown' : '__mouseIsDown';
    var isDown = isRightButton ? '__isRightDown' : '__isDown';

    // while
    // hit test
    for (var i = 0; i < length; i++)
    {
        var item = this.interactiveItems[i];

        if (item[downFunction] || item[clickFunction])
        {
            item[buttonIsDown] = true;
            item.__hit = this.hitTest(item, this.mouse);

            if (item.__hit)
            {
                //call the function!
                if (item[downFunction])
                {
                    item[downFunction](this.mouse);
                }
                item[isDown] = true;

                // just the one!
                if (!item.interactiveChildren) break;
            }
        }
    }
};

/**
 * Is called when the mouse is moved out of the renderer element
 *
 * @method onMouseOut
 * @param event {Event} The DOM event of a mouse being moved out
 * @private
 */
PIXI.InteractionManager.prototype.onMouseOut = function(event)
{
    if (this.dirty)
    {
        this.rebuildInteractiveGraph();
    }

    this.mouse.originalEvent = event;

    var length = this.interactiveItems.length;

    this.interactionDOMElement.style.cursor = 'inherit';

    for (var i = 0; i < length; i++)
    {
        var item = this.interactiveItems[i];
        if (item.__isOver)
        {
            this.mouse.target = item;
            if (item.mouseout)
            {
                item.mouseout(this.mouse);
            }
            item.__isOver = false;
        }
    }

    this.mouseOut = true;

    // move the mouse to an impossible position
    this.mouse.global.x = -10000;
    this.mouse.global.y = -10000;
};

/**
 * Is called when the mouse button is released on the renderer element
 *
 * @method onMouseUp
 * @param event {Event} The DOM event of a mouse button being released
 * @private
 */
PIXI.InteractionManager.prototype.onMouseUp = function(event)
{
    if (this.dirty)
    {
        this.rebuildInteractiveGraph();
    }

    this.mouse.originalEvent = event;

    var length = this.interactiveItems.length;
    var up = false;

    var e = this.mouse.originalEvent;
    var isRightButton = e.button === 2 || e.which === 3;

    var upFunction = isRightButton ? 'rightup' : 'mouseup';
    var clickFunction = isRightButton ? 'rightclick' : 'click';
    var upOutsideFunction = isRightButton ? 'rightupoutside' : 'mouseupoutside';
    var isDown = isRightButton ? '__isRightDown' : '__isDown';

    for (var i = 0; i < length; i++)
    {
        var item = this.interactiveItems[i];

        if (item[clickFunction] || item[upFunction] || item[upOutsideFunction])
        {
            item.__hit = this.hitTest(item, this.mouse);

            if (item.__hit && !up)
            {
                //call the function!
                if (item[upFunction])
                {
                    item[upFunction](this.mouse);
                }
                if (item[isDown])
                {
                    if (item[clickFunction])
                    {
                        item[clickFunction](this.mouse);
                    }
                }

                if (!item.interactiveChildren)
                {
                    up = true;
                }
            }
            else
            {
                if (item[isDown])
                {
                    if (item[upOutsideFunction]) item[upOutsideFunction](this.mouse);
                }
            }

            item[isDown] = false;
        }
    }
};

/**
 * Tests if the current mouse coordinates hit a sprite
 *
 * @method hitTest
 * @param item {DisplayObject} The displayObject to test for a hit
 * @param interactionData {InteractionData} The interactionData object to update in the case there is a hit
 * @private
 */
PIXI.InteractionManager.prototype.hitTest = function(item, interactionData)
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

    interactionData.target = item;

    //a sprite or display object with a hit area defined
    if (item.hitArea && item.hitArea.contains)
    {
        return item.hitArea.contains(x, y);
    }
    // a sprite with no hitarea defined
    else if(item instanceof PIXI.Sprite)
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
    else if(item instanceof PIXI.Graphics)
    {
        var graphicsData = item.graphicsData;
        for (i = 0; i < graphicsData.length; i++)
        {
            var data = graphicsData[i];
            if(!data.fill)continue;

            // only deal with fills..
            if(data.shape)
            {
                if(data.shape.contains(x, y))
                {
                    //interactionData.target = item;
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
            // hmm.. TODO SET CORRECT TARGET?
            interactionData.target = item;
            return true;
        }
    }
    return false;
};

/**
 * Is called when a touch is moved across the renderer element
 *
 * @method onTouchMove
 * @param event {Event} The DOM event of a touch moving across the renderer view
 * @private
 */
PIXI.InteractionManager.prototype.onTouchMove = function(event)
{
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
        touchData.global.x = ( (touchEvent.clientX - rect.left) * (this.target.width / rect.width) ) / this.resolution;
        touchData.global.y = ( (touchEvent.clientY - rect.top)  * (this.target.height / rect.height) )  / this.resolution;
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
 * @method onTouchStart
 * @param event {Event} The DOM event of a touch starting on the renderer view
 * @private
 */
PIXI.InteractionManager.prototype.onTouchStart = function(event)
{
    if (this.dirty)
    {
        this.rebuildInteractiveGraph();
    }

    var rect = this.interactionDOMElement.getBoundingClientRect();

    if (PIXI.AUTO_PREVENT_DEFAULT)
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
            touchData = new PIXI.InteractionData();
        }

        touchData.originalEvent = event;

        this.touches[touchEvent.identifier] = touchData;
        touchData.global.x = ( (touchEvent.clientX - rect.left) * (this.target.width / rect.width) ) / this.resolution;
        touchData.global.y = ( (touchEvent.clientY - rect.top)  * (this.target.height / rect.height) ) / this.resolution;
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
                item.__hit = this.hitTest(item, touchData);

                if (item.__hit)
                {
                    //call the function!
                    if (item.touchstart)item.touchstart(touchData);
                    item.__isDown = true;
                    item.__touchData = item.__touchData || {};
                    item.__touchData[touchEvent.identifier] = touchData;

                    if (!item.interactiveChildren) break;
                }
            }
        }
    }
};

/**
 * Is called when a touch is ended on the renderer element
 *
 * @method onTouchEnd
 * @param event {Event} The DOM event of a touch ending on the renderer view
 * @private
 */
PIXI.InteractionManager.prototype.onTouchEnd = function(event)
{
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
        touchData.global.x = ( (touchEvent.clientX - rect.left) * (this.target.width / rect.width) ) / this.resolution;
        touchData.global.y = ( (touchEvent.clientY - rect.top)  * (this.target.height / rect.height) ) / this.resolution;
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

                item.__hit = this.hitTest(item, item.__touchData[touchEvent.identifier]);

                // so this one WAS down...
                touchData.originalEvent = event;
                // hitTest??

                if (item.touchend || item.tap)
                {
                    if (item.__hit && !up)
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

/**
 * Is called when a touch is canceled
 *
 * @method onTouchCancel
 * @param event {Event} The DOM event of a touch canceled
 * @private
 */
PIXI.InteractionManager.prototype.onTouchCancel = function(event)
{
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
        touchData.global.x = ( (touchEvent.clientX - rect.left) * (this.target.width / rect.width) ) / this.resolution;
        touchData.global.y = ( (touchEvent.clientY - rect.top)  * (this.target.height / rect.height) ) / this.resolution;
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

                item.__hit = this.hitTest(item, item.__touchData[touchEvent.identifier]);

                // so this one WAS down...
                touchData.originalEvent = event;
                // hitTest??

                if (item.touchcancel && !up)
                {
                    item.touchcancel(touchData);
                    if (!item.interactiveChildren)
                    {
                        up = true;
                    }
                }

                item.__isDown = false;
                item.__touchData[touchEvent.identifier] = null;
            }
        }
        // remove the touch..
        this.pool.push(touchData);
        this.touches[touchEvent.identifier] = null;
    }
};
