var core = require('../core'),
    InteractionData = require('./InteractionData');


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
    this.eventData = new core.utils.EventData();
    this.eventData.data = this.mouse;

    /**
     * An object that stores current touches (InteractionData) by id reference
     *
     * @member {object}
     */
    this.touches = {};

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
    this.onMouseUp = this.onMouseUp.bind(this);
    this.mouseUp = this.mouseUp.bind( this );


    /**
     * @member {Function}
     */
    this.onMouseDown = this.onMouseDown.bind(this);
    this.processMouseDown = this.processMouseDown.bind( this );

    /**
     * @member {Function}
     */
    this.onMouseMove = this.onMouseMove.bind( this );
    this.processMouseMove = this.processMouseMove.bind( this );

    /**
     * @member {Function}
     */
    this.onMouseOut = this.onMouseOut.bind(this);
    this.processMouseOverOut = this.processMouseOverOut.bind( this );


    /**
     * @member {Function}
     */
    this.onTouchStart = this.onTouchStart.bind(this);
    this.processTouchStart = this.processTouchStart.bind(this);

    /**
     * @member {Function}
     */
    this.onTouchEnd = this.onTouchEnd.bind(this);
    this.processTouchEnd = this.processTouchEnd.bind(this);

    /**
     * @member {Function}
     */
    this.onTouchMove = this.onTouchMove.bind(this);
    this.processTouchMove = this.processTouchMove.bind(this);

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

    // if the user move the mouse this check has already been dfone using the mouse move!
    if(this.didMove)
    {
        this.didMove = false;
        return;
    }

    this.cursor = 'inherit';

    this.processInteractive(this.mouse.global, this.renderer._lastObjectRendered , this.processMouseOverOut.bind(this) , true );

    if (this.currentCursorStyle !== this.cursor)
    {
        this.currentCursorStyle = this.cursor;
        this.interactionDOMElement.style.cursor = this.cursor;
    }

    //TODO
};


InteractionManager.prototype.dispatchEvent = function ( displayObject, eventString, eventData )
{
    if(!eventData.stopped)
    {

        eventData.target = displayObject;
        eventData.type = eventString;

        displayObject.emit( eventString, this.eventData, eventData );
    }
};

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
};

InteractionManager.prototype.mapPositionToPoint = function ( point, x, y )
{
    var rect = this.interactionDOMElement.getBoundingClientRect();
    point.x = ( ( x - rect.left ) * (this.interactionDOMElement.width  / rect.width  ) ) / this.resolution;
    point.y = ( ( y - rect.top  ) * (this.interactionDOMElement.height / rect.height ) ) / this.resolution;
};

InteractionManager.prototype.processInteractive = function (point, displayObject, func, hitTest )
{
    if(!displayObject.interactiveChildren || !displayObject.visible)
    {
        return false;
    }

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
};





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
            this.dispatchEvent( displayObject, isRightButton ? 'rightclick' : 'click', this.eventData );
        }
    }
    else
    {
        if( displayObject[ isDown ] )
        {
            displayObject[ isDown ] = false;
            this.dispatchEvent( displayObject, isRightButton ? 'rightupoutside' : 'mouseupoutside', this.eventData );
        }
    }
};

InteractionManager.prototype.processMouseDown = function ( displayObject, hit )
{
    var e = this.mouse.originalEvent;

    var isRightButton = e.button === 2 || e.which === 3;

    if(hit)
    {
        displayObject[ isRightButton ? '_isRightDown' : '_isLeftDown' ] = true;
        this.dispatchEvent( displayObject, isRightButton ? 'rightdown' : 'mousedown', this.eventData );
    }
};

InteractionManager.prototype.processMouseMove = function ( displayObject, hit )
{
    displayObject.emit('mousemove', this.eventData);
    this.processMouseOverOut(displayObject, hit);
};

InteractionManager.prototype.processMouseOverOut = function ( displayObject, hit )
{
    if(hit)
    {
        if(!displayObject._over)
        {
            displayObject._over = true;
            displayObject.emit( 'mouseover', this.eventData);
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
            displayObject.emit( 'mouseout', this.eventData);
        }
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
    this.eventData.stopped = false;

    this.processInteractive(this.mouse.global, this.renderer._lastObjectRendered, this.mouseUp, true );
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
    this.eventData.stopped = false;

    if (AUTO_PREVENT_DEFAULT)
    {
        this.mouse.originalEvent.preventDefault();
    }

    this.processInteractive(this.mouse.global, this.renderer._lastObjectRendered, this.processMouseDown, true );
};




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
    this.mapPositionToPoint( this.mouse.global, event.clientX, event.clientY);

    this.didMove = true;

    this.cursor = 'inherit';

    this.eventData.stopped = false;

    this.processInteractive(this.mouse.global, this.renderer._lastObjectRendered, this.processMouseMove, true );

    if (this.currentCursorStyle !== this.cursor)
    {
        this.currentCursorStyle = this.cursor;
        this.interactionDOMElement.style.cursor = this.cursor;
    }

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
    this.eventData.stopped = false;

    this.interactionDOMElement.style.cursor = 'inherit';

    // TODO optimize by not check EVERY TIME! maybe half as often? //
    this.mapPositionToPoint( this.mouse.global, event.clientX, event.clientY );

    this.processInteractive( this.mouse.global, this.renderer._lastObjectRendered, this.processMouseOverOut, false );
};



/////////// STILL REDOING..


/**
 * Is called when a touch is ended on the renderer element
 *
 * @param event {Event} The DOM event of a touch ending on the renderer view
 * @private
 */
InteractionManager.prototype.processTouchStart = function ( displayObject, hit )
{
    //console.log("hit" + hit)
    if(hit)
    {
        displayObject._touchDown = true;
        this.dispatchEvent( displayObject, 'touchstart', this.eventData );
    }
};

InteractionManager.prototype.processTouchEnd = function ( displayObject, hit )
{
    if(hit)
    {
        displayObject.emit( 'touchend' );

        if( displayObject._touchDown )
        {
            displayObject._touchDown = false;
            this.dispatchEvent( displayObject, 'tap', this.eventData );
        }
    }
    else
    {
        if( displayObject._touchDown )
        {
            displayObject._touchDown = false;
            this.dispatchEvent( displayObject, 'touchendoutside', this.eventData );
        }
    }
};

InteractionManager.prototype.processTouchMove = function ( displayObject, hit )
{
    hit = hit;
    displayObject.emit('touchmove', this.eventData);
};


/**
 * Is called when a touch is started on the renderer element
 *
 * @param event {Event} The DOM event of a touch starting on the renderer view
 * @private
 */
InteractionManager.prototype.onTouchStart = function (event)
{
    if (AUTO_PREVENT_DEFAULT)
    {
        event.preventDefault();
    }

    var changedTouches = event.changedTouches;

    for (var i=0; i < changedTouches.length; i++)
    {
        var touchEvent = changedTouches[i];
        //TODO POOL
        var touchData = this.getTouchData( touchEvent );

        touchData.originalEvent = event;

        this.mapPositionToPoint( touchData, touchEvent.clientX, touchEvent.clientY );

        this.processInteractive( touchData, this.renderer._lastObjectRendered, this.processTouchStart, true );

        this.returnTouchData( touchData );
    }
};

InteractionManager.prototype.onTouchEnd = function (event)
{
    if (AUTO_PREVENT_DEFAULT)
    {
        event.preventDefault();
    }

    var changedTouches = event.changedTouches;

    for (var i=0; i < changedTouches.length; i++)
    {
        var touchEvent = changedTouches[i];

        var touchData = this.getTouchData( touchEvent );

        touchData.originalEvent = event;

        this.mapPositionToPoint( touchData, touchEvent.clientX, touchEvent.clientY );

        this.processInteractive( touchData, this.renderer._lastObjectRendered, this.processTouchEnd, true );

        this.returnTouchData( touchData );
    }
};

/**
 * Is called when a touch is moved across the renderer element
 *
 * @param event {Event} The DOM event of a touch moving across the renderer view
 * @private
 */
InteractionManager.prototype.onTouchMove = function (event)
{
    if (AUTO_PREVENT_DEFAULT)
    {
        event.preventDefault();
    }

    var changedTouches = event.changedTouches;

    for (var i=0; i < changedTouches.length; i++)
    {
        var touchEvent = changedTouches[i];

        var touchData = this.getTouchData( touchEvent );

        touchData.originalEvent = event;

        this.processInteractive( touchData, this.renderer._lastObjectRendered, this.processTouchMove, false );

        this.returnTouchData( touchData );
    }
};

InteractionManager.prototype.getTouchData = function (touchEvent)
{
    var touchData = this.pool.pop();

    if(!touchData)
    {
        touchData = new InteractionData();
    }

    touchData.identifier = touchEvent.identifier;

    this.mapPositionToPoint( touchData, touchEvent.clientX, touchEvent.clientY );
};

InteractionManager.prototype.returnTouchData = function ( touchData )
{
    this.pool.push( touchData );
};



core.WebGLRenderer.registerPlugin('interaction', InteractionManager);
