var core = require('../core'),
    InteractionData = require('./InteractionData')


// TODO: Obviously rewrite this...
var INTERACTION_FREQUENCY = 10;
var AUTO_PREVENT_DEFAULT = true;

/**
 * The interaction manager deals with mouse and touch events. Any DisplayObject can be interactive
 * if its interactive parameter is set to true
 * This manager also supports multitouch.
 *
 * @class
 * @namespace PIXI
 * @param stage {Stage} The stage to handle interactions
 */
function InteractionManager( renderer )
{
    this.renderer = renderer;

    /**
     * The mouse data
     *
     * @member {InteractionData}
     */
    this.mouse = new InteractionData();

    this.mouseEventData = new core.utils.EventData();
    this.mouseEventData.data = this.mouse;
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
     * An array containing all the iterative items from the our interactive tree
     *
     * @member {Array}
     * @private
     */
    this.interactiveItems = [];

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
    this.onMouseMove = this.onMouseMove.bind( this );
    this.mouseMove = this.mouseMove.bind( this );

    /**
     * @member {Function}
     */
    this.onMouseDown = this.onMouseDown.bind(this);
    this.mouseDown = this.mouseDown.bind( this );

    /**
     * @member {Function}
     */
    this.onMouseOut = this.onMouseOut.bind(this);
    this.mouseOverOut = this.mouseOverOut.bind( this );

    /**
     * @member {Function}
     */
    this.onMouseUp = this.onMouseUp.bind(this);
    this.mouseUp = this.mouseUp.bind( this );

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
    this.last = 0;

    /**
     * The css style of the cursor that is being used
     * @member {string}
     */
    this.currentCursorStyle = 'inherit';

    /**
     * Is set to true when the mouse is moved out of the canvas
     * @member {boolean}
     */
    this.mouseOut = false;

    /**
     * @member {number}
     */
    this.resolution = 1;

    // used for hit testing
    this._tempPoint = new core.math.Point();

    this.setTargetElement(this.renderer.view);

    this.update();
}

InteractionManager.prototype.constructor = InteractionManager;
module.exports = InteractionManager;

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

    this.interactionDOMElement.addEventListener('mousemove',    this.onMouseMove, true);
    this.interactionDOMElement.addEventListener('mousedown',    this.onMouseDown, true);
    this.interactionDOMElement.addEventListener('mouseout',     this.onMouseOut, true);

    this.interactionDOMElement.addEventListener('touchstart',   this.onTouchStart, true);
    this.interactionDOMElement.addEventListener('touchend',     this.onTouchEnd, true);
    this.interactionDOMElement.addEventListener('touchmove',    this.onTouchMove, true);

    window.addEventListener('mouseup',  this.onMouseUp, true);

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
 * updates the state of interactive objects
 *
 * @private
 */
InteractionManager.prototype.update = function ()
{
    requestAnimationFrame(this.update.bind(this));

    if( this.throttleUpdate() || !this.interactionDOMElement)
    {
        return;
    }

    var i = 0;

    // if the user move the mouse this check has already been dfone using the mouse move!
    if(this.didMove)
    {
        this.didMove = false;
        return;
    }

    this.cursor = 'inherit';

    this.processInteractive(this.mouse.global, this.renderer._lastObjectRendered , this.mouseOverOut.bind(this) , true );

    if (this.currentCursorStyle !== this.cursor)
    {
        this.currentCursorStyle = this.cursor;
        this.interactionDOMElement.style.cursor = this.cursor;
    }

    //TODO
};

InteractionManager.prototype.processInteractive = function (point, displayObject, func, hitTest )
{
    var children = displayObject.children;

    var hit = false;

    for (var i = children.length-1; i >= 0; i--)
    {
        if(! hit  && hitTest)
        {
            hit = this.processInteractive(point, children[i], func, true );
        }
        else
        {
            // now we know we can miss it all!
            this.processInteractive(point, children[i], func, false );
        }
    }

    if(displayObject.interactive)
    {
        if(hitTest)
        {
            //TODO test only graphics and sprites at the mo..
            if(displayObject.hitTest)
            {
                hit = displayObject.hitTest(point);
            }
        }

        func(displayObject, hit);
    }

    return hit;
}

InteractionManager.prototype.mouseOverOut = function ( displayObject, hit )
{
    if(hit)
    {
        if(!displayObject._over)
        {
            displayObject._over = true;
            displayObject.emit( "mouseover", this.mouseEventData);
        }

        if (displayObject.buttonMode)
        {
            this.cursor = displayObject.defaultCursor;
        }
    }
    else
    {
        if(displayObject._over)
        {
            displayObject._over = false;
            displayObject.emit( "mouseout", this.mouseEventData);
        }
    }
}

InteractionManager.prototype.mouseDown = function ( displayObject, hit )
{
    var e = this.mouse.originalEvent;

    var isRightButton = e.button === 2 || e.which === 3;

    if(hit)
    {
        displayObject[ isRightButton ? '_isRightDown' : '_isLeftDown' ] = true;
        this.dispatchEvent( displayObject, isRightButton ? 'rightdown' : 'mousedown', this.mouseEventData );
    }
}

InteractionManager.prototype.mouseUp = function ( displayObject, hit )
{
    var e = this.mouse.originalEvent;

    var isRightButton = e.button === 2 || e.which === 3;
    var isDown =  isRightButton ? '_isRightDown' : '_isLeftDown';

    if(hit)
    {
        displayObject.emit( isRightButton ? 'rightup' : 'mouseup' );

        if( displayObject[ isDown ] )
        {
            displayObject[ isDown ] = false;
            this.dispatchEvent( displayObject, isRightButton ? 'rightclick' : 'click', this.mouseEventData );
        }
    }
    else
    {
        if( displayObject[ isDown ] )
        {
            displayObject[ isDown ] = false;
            this.dispatchEvent( displayObject, isRightButton ? 'rightupoutside' : 'mouseupoutside', this.mouseEventData );
        }
    }
}

InteractionManager.prototype.mouseMove = function ( displayObject, hit )
{
    displayObject.emit('mousemove', this.mouseEventData);
    this.mouseOverOut(displayObject, hit);
}

InteractionManager.prototype.dispatchEvent = function ( displayObject, eventString, eventData )
{
    if(!eventData.stopped)
    {

        eventData.target = displayObject;
        eventData.type = eventString;

        displayObject.emit( eventString, this.mouseEventData, eventData );
    }
}

InteractionManager.prototype.throttleUpdate = function ()
{
    // frequency of 30fps??
    var now = Date.now();
    var diff = now - this.last;
    diff = (diff * INTERACTION_FREQUENCY ) / 1000;
    if (diff < 1)
    {
        return true;
    }

    this.last = now;

    return false;
}

/**
 * Is called when the mouse moves across the renderer element
 *
 * @param event {Event} The DOM event of the mouse moving
 * @private
 */
InteractionManager.prototype.onMouseMove = function (event)
{
    if (this.dirty)
    {
        this.rebuildInteractiveGraph();
    }

    this.mouse.originalEvent = event;

    // TODO optimize by not check EVERY TIME! maybe half as often? //
    var rect = this.interactionDOMElement.getBoundingClientRect();

    this.mouse.global.x = (event.clientX - rect.left) * (this.interactionDOMElement.width / rect.width) / this.resolution;
    this.mouse.global.y = (event.clientY - rect.top) * ( this.interactionDOMElement.height / rect.height) / this.resolution;

    this.didMove = true;

    this.cursor = 'inherit';

    this.mouseEventData.stopped = false;

    this.processInteractive(this.mouse.global, this.renderer._lastObjectRendered , this.mouseMove , true );

    if (this.currentCursorStyle !== this.cursor)
    {
        this.currentCursorStyle = this.cursor;
        this.interactionDOMElement.style.cursor = this.cursor;
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
    this.mouseEventData.stopped = false;

    if (AUTO_PREVENT_DEFAULT)
    {
        this.mouse.originalEvent.preventDefault();
    }

    this.processInteractive(this.mouse.global, this.renderer._lastObjectRendered , this.mouseDown , true );
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
    this.mouseEventData.stopped = false;

    this.processInteractive(this.mouse.global, this.renderer._lastObjectRendered , this.mouseUp , true );
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
    this.mouseEventData.stopped = false;

    this.interactionDOMElement.style.cursor = 'inherit';

    // TODO - not need any more i hope! move the mouse to an impossible position
    // this.mouse.global.x = -10000;
    // this.mouse.global.y = -10000;

    this.processInteractive(this.mouse.global, this.renderer._lastObjectRendered , this.mouseOverOut , false );
};



/////////// STILL REDOING..

/**
 * Is called when a touch is moved across the renderer element
 *
 * @param event {Event} The DOM event of a touch moving across the renderer view
 * @private
 */
InteractionManager.prototype.onTouchMove = function (event)
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
    if (this.dirty)
    {
        this.rebuildInteractiveGraph();
    }

    var rect = this.interactionDOMElement.getBoundingClientRect();

    if (AUTO_PREVENT_DEFAULT)
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
                item.__hit = this.hitTest(item, touchData);

                if (item.__hit)
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

core.WebGLRenderer.registerPlugin('interaction', InteractionManager);
