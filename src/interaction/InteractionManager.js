var core = require('../core'),
    InteractionData = require('./InteractionData'),
    Device = require('ismobilejs');

// Mix interactiveTarget into core.DisplayObject.prototype
Object.assign(
    core.DisplayObject.prototype,
    require('./interactiveTarget')
);

/**
 * The interaction manager deals with mouse and touch events. Any DisplayObject can be interactive
 * if its interactive parameter is set to true
 * This manager also supports multitouch.
 *
 * @class
 * @memberof PIXI.interaction
 * @param renderer {PIXI.CanvasRenderer|PIXI.WebGLRenderer} A reference to the current renderer
 * @param [options] {object}
 * @param [options.autoPreventDefault=true] {boolean} Should the manager automatically prevent default browser actions.
 * @param [options.interactionFrequency=10] {number} Frequency increases the interaction events will be checked.
 */
function InteractionManager(renderer, options)
{
    options = options || {};

    /**
     * The renderer this interaction manager works for.
     *
     * @member {PIXI.SystemRenderer}
     */
    this.renderer = renderer;

    /**
     * Should default browser actions automatically be prevented.
     *
     * @member {boolean}
     * @default true
     */
    this.autoPreventDefault = options.autoPreventDefault !== undefined ? options.autoPreventDefault : true;

    /**
     * As this frequency increases the interaction events will be checked more often.
     *
     * @member {number}
     * @default 10
     */
    this.interactionFrequency = options.interactionFrequency || 10;

    /**
     * The mouse data
     *
     * @member {PIXI.interaction.InteractionData}
     */
    this.mouse = new InteractionData();

    /**
     * The pointer data
     *
     * @member {PIXI.interaction.InteractionData}
     */
    this.pointer = new InteractionData();

    /**
     * An event data object to handle all the event tracking/dispatching
     *
     * @member {object}
     */
    this.eventData = {
        stopped: false,
        target: null,
        type: null,
        data: this.mouse,
        stopPropagation:function(){
            this.stopped = true;
        }
    };

    /**
     * Tiny little interactiveData pool !
     *
     * @member {PIXI.interaction.InteractionData[]}
     */
    this.interactiveDataPool = [];

    /**
     * The DOM element to bind to.
     *
     * @member {HTMLElement}
     * @private
     */
    this.interactionDOMElement = null;

    /**
     * This property determins if mousemove and touchmove events are fired only when the cursror is over the object
     * Setting to true will make things work more in line with how the DOM verison works.
     * Setting to false can make things easier for things like dragging
     * It is currently set to false as this is how pixi used to work. This will be set to true in future versions of pixi.
     * @member {boolean}
     */
    this.moveWhenInside = false;

    /**
     * Have events been attached to the dom element?
     *
     * @member {boolean}
     * @private
     */
    this.eventsAdded = false;

    /**
     * Does the device support touch events
     * https://www.w3.org/TR/touch-events/

     * @member {boolean}
     * @readonly
     */
    this.supportsTouchEvents = 'ontouchstart' in window;

    /**
     * Does the device support pointer events
     * https://www.w3.org/Submission/pointer-events/
     *
     * @member {boolean}
     * @readonly
     */
    this.supportsPointerEvents = !!window.PointerEvent;

    /**
     * A list of  mouse events that the Interaction Manager can invoke to Display Objects
     *
     * @member {string[]}
     * @readonly
     */
    this.mouseEvents = ['mousedown','mouseup','rightdown','rightup','click','rightclick','mousemove','mouseover','mouseout','mouseupoutside','rightupoutside'];

    /**
     * A list of the touch events that the Interaction Manager can invoke to Display Objects
     *
     * @member {string[]}
     * @readonly
     */
    this.touchEvents = ['touchstart','touchend','tap','touchmove','touchendoutside'];

    /**
     * A list of the pointer events that the Interaction Manager can invoke to Display Objects
     *
     * @member {string[]}
     * @readonly
     */
    this.pointerEvents = ['pointerdown','pointerup','pointertap','pointermove','pointerover','pointerout','pointerupoutside'];

    /**
     * Are touch events being 'normalized' and converted into pointer events if pointer events are not supported
     * For example, on a touch screen mobile device, a touchstart would also be emitted as a pointerdown
     *
     * @member {boolean}
     * @readonly
     * @private
     */
    this.normalizingTouchEvents = !this.supportsPointerEvents && this.supportsTouchEvents && Device.any;

    /**
     * Are mouse events being 'normalized' and converted into pointer events if pointer events are not supported
     * For example, on a desktop pc, a mousedown would also be emitted as a pointerdown
     *
     * @member {boolean}
     * @readonly
     * @private
     */
    this.normalizingMouseEvents = !this.supportsPointerEvents && !this.normalizingTouch;


    //this will make it so that you don't have to call bind all the time

    /**
     * @member {Function}
     * @private
     */
    this.onMouseUp = this.onMouseUp.bind(this);
    this.processMouseUp = this.processMouseUp.bind( this );

    /**
     * @member {Function}
     *  @private
     */
    this.onMouseDown = this.onMouseDown.bind(this);
    this.processMouseDown = this.processMouseDown.bind( this );

    /**
     * @member {Function}
     * @private
     */
    this.onMouseMove = this.onMouseMove.bind( this );
    this.processMouseMove = this.processMouseMove.bind( this );

    /**
     * @member {Function}
     * @private
     */
    this.onMouseOut = this.onMouseOut.bind(this);
    this.processMouseOverOut = this.processMouseOverOut.bind( this );


    /**
    * @member {Function}
    */
    this.onPointerUp = this.onPointerUp.bind(this);
    this.processPointerUp = this.processPointerUp.bind( this );

    /**
    * @member {Function}
    */
    this.onPointerDown = this.onPointerDown.bind(this);
    this.processPointerDown = this.processPointerDown.bind( this );

    /**
    * @member {Function}
    */
    this.onPointerMove = this.onPointerMove.bind(this);
    this.processPointerMove = this.processPointerMove.bind( this );

    /**
    * @member {Function}
    */
    this.onPointerOut = this.onPointerOut.bind(this);
    this.processPointerOverOut = this.processPointerOverOut.bind( this );


    /**
     * @member {Function}
     * @private
     */
    this.onTouchStart = this.onTouchStart.bind(this);
    this.processTouchStart = this.processTouchStart.bind(this);

    /**
     * @member {Function}
     * @private
     */
    this.onTouchEnd = this.onTouchEnd.bind(this);
    this.processTouchEnd = this.processTouchEnd.bind(this);

    /**
     * @member {Function}
     * @private
     */
    this.onTouchMove = this.onTouchMove.bind(this);
    this.processTouchMove = this.processTouchMove.bind(this);

    /**
     * Every update cursor will be reset to this value, if some element wont override it in its hitTest
     * @member {string}
     * @default 'inherit'
     */
    this.defaultCursorStyle = 'inherit';

    /**
     * The css style of the cursor that is being used
     * @member {string}
     */
    this.currentCursorStyle = 'inherit';

    /**
     * Internal cached var
     * @member {PIXI.Point}
     * @private
     */
    this._tempPoint = new core.Point();


    /**
     * The current resolution / device pixel ratio.
     * @member {number}
     * @default 1
     */
    this.resolution = 1;

    this.setTargetElement(this.renderer.view, this.renderer.resolution);
}

InteractionManager.prototype.constructor = InteractionManager;
module.exports = InteractionManager;

/**
 * Sets the DOM element which will receive mouse/touch events. This is useful for when you have
 * other DOM elements on top of the renderers Canvas element. With this you'll be bale to deletegate
 * another DOM element to receive those events.
 *
 * @param element {HTMLElement} the DOM element which will receive mouse and touch events.
 * @param [resolution=1] {number} The resolution / device pixel ratio of the new element (relative to the canvas).
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
 * Registers all the DOM events
 *
 * @private
 */
InteractionManager.prototype.addEvents = function ()
{
    if (!this.interactionDOMElement)
    {
        return;
    }

    core.ticker.shared.add(this.update, this);

    if (window.navigator.msPointerEnabled)
    {
        this.interactionDOMElement.style['-ms-content-zooming'] = 'none';
        this.interactionDOMElement.style['-ms-touch-action'] = 'none';
    }
    else if (this.supportsPointerEvents)
    {
        this.interactionDOMElement.style['touch-action'] = 'none';
    }

    window.document.addEventListener('mousemove', this.onMouseMove, true);
    this.interactionDOMElement.addEventListener('mousedown', this.onMouseDown, true);
    this.interactionDOMElement.addEventListener('mouseout', this.onMouseOut, true);
	window.addEventListener('mouseup', this.onMouseUp, true);

	if (this.supportsTouchEvents)
    {
        this.interactionDOMElement.addEventListener('touchstart', this.onTouchStart, true);
        this.interactionDOMElement.addEventListener('touchend', this.onTouchEnd, true);
        this.interactionDOMElement.addEventListener('touchmove', this.onTouchMove, true);
    }

    if (this.supportsPointerEvents)
    {
        window.document.addEventListener('pointermove', this.onPointerMove, true);
        this.interactionDOMElement.addEventListener('pointerdown', this.onPointerDown, true);
        this.interactionDOMElement.addEventListener('pointerleave', this.onPointerOut, true);
        window.addEventListener('pointerup', this.onPointerUp, true);
    }
    else
    {
        /**
         * If pointer events aren't available on a device, this will turn either the touch or mouse events into pointer events
         * This allows a developer to just listen for emitted pointer events on interactive sprites
         */
        if (this.normalizingTouchEvents)
        {
            this.interactionDOMElement.addEventListener('touchstart', this.onPointerDown, true);
            this.interactionDOMElement.addEventListener('touchend', this.onPointerUp, true);
            this.interactionDOMElement.addEventListener('touchmove', this.onPointerMove, true);
        }
        else if (this.normalizingMouseEvents)
        {
            window.document.addEventListener('mousemove', this.onPointerMove, true);
            this.interactionDOMElement.addEventListener('mousedown', this.onPointerDown, true);
            this.interactionDOMElement.addEventListener('mouseout', this.onPointerOut, true);
            window.addEventListener('mouseup', this.onPointerUp, true);
        }
    }

    this.eventsAdded = true;
};

/**
 * Removes all the DOM events that were previously registered
 *
 * @private
 */
InteractionManager.prototype.removeEvents = function ()
{
    if (!this.interactionDOMElement)
    {
        return;
    }

    core.ticker.shared.remove(this.update);

    if (window.navigator.msPointerEnabled)
    {
        this.interactionDOMElement.style['-ms-content-zooming'] = '';
        this.interactionDOMElement.style['-ms-touch-action'] = '';
    }
    else if (this.supportsPointerEvents)
    {
        this.interactionDOMElement.style['touch-action'] = '';
    }

    window.document.removeEventListener('mousemove', this.onMouseMove, true);
    this.interactionDOMElement.removeEventListener('mousedown', this.onMouseDown, true);
    this.interactionDOMElement.removeEventListener('mouseout', this.onMouseOut, true);
	window.removeEventListener('mouseup', this.onMouseUp, true);

	if (this.supportsTouchEvents)
    {
        this.interactionDOMElement.removeEventListener('touchstart', this.onTouchStart, true);
        this.interactionDOMElement.removeEventListener('touchend', this.onTouchEnd, true);
        this.interactionDOMElement.removeEventListener('touchmove', this.onTouchMove, true);
    }

    if (this.supportsPointerEvents)
    {
        window.document.removeEventListener('pointermove', this.onPointerMove, true);
        this.interactionDOMElement.removeEventListener('pointerdown', this.onPointerDown, true);
        this.interactionDOMElement.removeEventListener('pointerleave', this.onPointerOut, true);
        window.removeEventListener('pointerup', this.onPointerUp, true);
    }
    else
    {
        /**
         * If pointer events aren't available on a device, this will turn either the touch or mouse events into pointer events
         * This allows a developer to just listen for emitted pointer events on interactive sprites
         */
        if (this.normalizingTouchEvents)
        {
            this.interactionDOMElement.removeEventListener('touchstart', this.onPointerDown, true);
            this.interactionDOMElement.removeEventListener('touchend', this.onPointerUp, true);
            this.interactionDOMElement.removeEventListener('touchmove', this.onPointerMove, true);
        }
        else if (this.normalizingMouseEvents)
        {
            window.document.removeEventListener('mousemove', this.onPointerMove, true);
            this.interactionDOMElement.removeEventListener('mousedown', this.onPointerDown, true);
            this.interactionDOMElement.removeEventListener('mouseout', this.onPointerOut, true);
            window.removeEventListener('mouseup', this.onPointerUp, true);
        }
    }

    this.interactionDOMElement = null;

    this.eventsAdded = false;
};

/**
 * Updates the state of interactive objects.
 * Invoked by a throttled ticker update from
 * {@link PIXI.ticker.shared}.
 *
 * @param deltaTime {number} time delta since last tick
 */
InteractionManager.prototype.update = function (deltaTime)
{
    this._deltaTime += deltaTime;

    if (this._deltaTime < this.interactionFrequency)
    {
        return;
    }

    this._deltaTime = 0;

    if (!this.interactionDOMElement)
    {
        return;
    }

    // if the user move the mouse this check has already been dfone using the mouse move!
    if(this.didMove)
    {
        this.didMove = false;
        return;
    }

    this.cursor = this.defaultCursorStyle;

    this.processInteractive(this.mouse.global, this.renderer._lastObjectRendered, this.processMouseOverOut, true );

    if (this.currentCursorStyle !== this.cursor)
    {
        this.currentCursorStyle = this.cursor;
        this.interactionDOMElement.style.cursor = this.cursor;
    }

    //TODO
};

/**
 * Dispatches an event on the display object that was interacted with
 *
 * @param displayObject {PIXI.Container|PIXI.Sprite|PIXI.extras.TilingSprite} the display object in question
 * @param eventString {string} the name of the event (e.g, mousedown)
 * @param eventData {object} the event data object
 * @private
 */
InteractionManager.prototype.dispatchEvent = function ( displayObject, eventString, eventData )
{
    if(!eventData.stopped)
    {
        eventData.target = displayObject;
        eventData.type = eventString;

        displayObject.emit( eventString, eventData );

        if( displayObject[eventString] )
        {
            displayObject[eventString]( eventData );
        }
    }
};


/**
 * Maps x and y coords from a DOM object and maps them correctly to the pixi view. The resulting value is stored in the point.
 * This takes into account the fact that the DOM element could be scaled and positioned anywhere on the screen.
 *
 * @param  {PIXI.Point} point the point that the result will be stored in
 * @param  {number} x     the x coord of the position to map
 * @param  {number} y     the y coord of the position to map
 */
InteractionManager.prototype.mapPositionToPoint = function ( point, x, y )
{
    var rect;
    // IE 11 fix
    if(!this.interactionDOMElement.parentElement)
    {
        rect = { x: 0, y: 0, width: 0, height: 0 };
    } else {
        rect = this.interactionDOMElement.getBoundingClientRect();
    }

    point.x = ( ( x - rect.left ) * (this.interactionDOMElement.width  / rect.width  ) ) / this.resolution;
    point.y = ( ( y - rect.top  ) * (this.interactionDOMElement.height / rect.height ) ) / this.resolution;
};

/**
 * This function is provides a neat way of crawling through the scene graph and running a specified function on all interactive objects it finds.
 * It will also take care of hit testing the interactive objects and passes the hit across in the function.
 *
 * @param point {PIXI.Point} the point that is tested for collision
 * @param displayObject {PIXI.Container|PIXI.Sprite|PIXI.extras.TilingSprite} the displayObject that will be hit test (recurcsivly crawls its children)
 * @param [func] {Function} the function that will be called on each interactive object. The displayObject and hit will be passed to the function
 * @param [hitTest] {boolean} this indicates if the objects inside should be hit test against the point
 * @param [interactive] {boolean} Whether the displayObject is interactive
 * @return {boolean} returns true if the displayObject hit the point
 */
InteractionManager.prototype.processInteractive = function (point, displayObject, func, hitTest, interactive)
{
    if(!displayObject || !displayObject.visible)
    {
        return false;
    }

    // Took a little while to rework this function correctly! But now it is done and nice and optimised. ^_^
    //
    // This function will now loop through all objects and then only hit test the objects it HAS to, not all of them. MUCH faster..
    // An object will be hit test if the following is true:
    //
    // 1: It is interactive.
    // 2: It belongs to a parent that is interactive AND one of the parents children have not already been hit.
    //
    // As another little optimisation once an interactive object has been hit we can carry on through the scenegraph, but we know that there will be no more hits! So we can avoid extra hit tests
    // A final optimisation is that an object is not hit test directly if a child has already been hit.

    var hit = false,
        interactiveParent = interactive = displayObject.interactive || interactive;




    // if the displayobject has a hitArea, then it does not need to hitTest children.
    if(displayObject.hitArea)
    {
        interactiveParent = false;
    }

    // it has a mask! Then lets hit test that before continuing..
    if(hitTest && displayObject._mask)
    {
        if(!displayObject._mask.containsPoint(point))
        {
            hitTest = false;
        }
    }

    // it has a filterArea! Same as mask but easier, its a rectangle
    if(hitTest && displayObject.filterArea)
    {
        if(!displayObject.filterArea.contains(point.x, point.y))
        {
            hitTest = false;
        }
    }

    // ** FREE TIP **! If an object is not interactive or has no buttons in it (such as a game scene!) set interactiveChildren to false for that displayObject.
    // This will allow pixi to completly ignore and bypass checking the displayObjects children.
    if(displayObject.interactiveChildren)
    {
        var children = displayObject.children;

        for (var i = children.length-1; i >= 0; i--)
        {
            var child = children[i];

            // time to get recursive.. if this function will return if somthing is hit..
            if(this.processInteractive(point, child, func, hitTest, interactiveParent))
            {
                // its a good idea to check if a child has lost its parent.
                // this means it has been removed whilst looping so its best
                if(!child.parent)
                {
                    continue;
                }

                hit = true;

                // we no longer need to hit test any more objects in this container as we we now know the parent has been hit
                interactiveParent = false;

                // If the child is interactive , that means that the object hit was actually interactive and not just the child of an interactive object.
                // This means we no longer need to hit test anything else. We still need to run through all objects, but we don't need to perform any hit tests.

                //{
                hitTest = false;
                //}

                // we can break now as we have hit an object.
            }
        }
    }



    // no point running this if the item is not interactive or does not have an interactive parent.
    if(interactive)
    {
        // if we are hit testing (as in we have no hit any objects yet)
        // We also don't need to worry about hit testing if once of the displayObjects children has already been hit!
        if(hitTest && !hit)
        {

            if(displayObject.hitArea)
            {
                displayObject.worldTransform.applyInverse(point,  this._tempPoint);
                hit = displayObject.hitArea.contains( this._tempPoint.x, this._tempPoint.y );
            }
            else if(displayObject.containsPoint)
            {
                hit = displayObject.containsPoint(point);
            }


        }

        if(displayObject.interactive)
        {
            func(displayObject, hit);
        }
    }

    return hit;

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
    this.eventData.data = this.mouse;
    this.eventData.stopped = false;

    // Update internal mouse reference
    this.mapPositionToPoint( this.mouse.global, event.clientX, event.clientY);

    if (this.autoPreventDefault)
    {
        this.mouse.originalEvent.preventDefault();
    }

    this.processInteractive(this.mouse.global, this.renderer._lastObjectRendered, this.processMouseDown, true );
};

/**
 * Processes the result of the mouse down check and dispatches the event if need be
 *
 * @param displayObject {PIXI.Container|PIXI.Sprite|PIXI.extras.TilingSprite} The display object that was tested
 * @param hit {boolean} the result of the hit test on the display object
 * @private
 */
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



/**
 * Is called when the mouse button is released on the renderer element
 *
 * @param event {Event} The DOM event of a mouse button being released
 * @private
 */
InteractionManager.prototype.onMouseUp = function (event)
{
    this.mouse.originalEvent = event;
    this.eventData.data = this.mouse;
    this.eventData.stopped = false;

    // Update internal mouse reference
    this.mapPositionToPoint( this.mouse.global, event.clientX, event.clientY);

    this.processInteractive(this.mouse.global, this.renderer._lastObjectRendered, this.processMouseUp, true );
};

/**
 * Processes the result of the mouse up check and dispatches the event if need be
 *
 * @param displayObject {PIXI.Container|PIXI.Sprite|PIXI.extras.TilingSprite} The display object that was tested
 * @param hit {boolean} the result of the hit test on the display object
 * @private
 */
InteractionManager.prototype.processMouseUp = function ( displayObject, hit )
{
    var e = this.mouse.originalEvent;

    var isRightButton = e.button === 2 || e.which === 3;
    var isDown =  isRightButton ? '_isRightDown' : '_isLeftDown';

    if(hit)
    {
        this.dispatchEvent( displayObject, isRightButton ? 'rightup' : 'mouseup', this.eventData );

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


/**
 * Is called when the mouse moves across the renderer element
 *
 * @param event {Event} The DOM event of the mouse moving
 * @private
 */
InteractionManager.prototype.onMouseMove = function (event)
{
    this.mouse.originalEvent = event;
    this.eventData.data = this.mouse;
    this.eventData.stopped = false;

    this.mapPositionToPoint( this.mouse.global, event.clientX, event.clientY);

    this.didMove = true;

    this.cursor = this.defaultCursorStyle;

    this.processInteractive(this.mouse.global, this.renderer._lastObjectRendered, this.processMouseMove, true );

    if (this.currentCursorStyle !== this.cursor)
    {
        this.currentCursorStyle = this.cursor;
        this.interactionDOMElement.style.cursor = this.cursor;
    }

    //TODO BUG for parents ineractive object (border order issue)
};

/**
 * Processes the result of the mouse move check and dispatches the event if need be
 *
 * @param displayObject {PIXI.Container|PIXI.Sprite|PIXI.extras.TilingSprite} The display object that was tested
 * @param hit {boolean} the result of the hit test on the display object
 * @private
 */
InteractionManager.prototype.processMouseMove = function ( displayObject, hit )
{
    this.processMouseOverOut(displayObject, hit);

    // only display on mouse over
    if(!this.moveWhenInside || hit)
    {
        this.dispatchEvent( displayObject, 'mousemove', this.eventData);
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

    // Update internal mouse reference
    this.mapPositionToPoint( this.mouse.global, event.clientX, event.clientY);

    this.interactionDOMElement.style.cursor = this.defaultCursorStyle;

    // TODO optimize by not check EVERY TIME! maybe half as often? //
    this.mapPositionToPoint( this.mouse.global, event.clientX, event.clientY );

    this.processInteractive( this.mouse.global, this.renderer._lastObjectRendered, this.processMouseOverOut, false );
};

/**
 * Processes the result of the mouse over/out check and dispatches the event if need be
 *
 * @param displayObject {PIXI.Container|PIXI.Sprite|PIXI.extras.TilingSprite} The display object that was tested
 * @param hit {boolean} the result of the hit test on the display object
 * @private
 */
InteractionManager.prototype.processMouseOverOut = function ( displayObject, hit )
{
    if(hit)
    {
        if(!displayObject._mouseOver)
        {
            displayObject._mouseOver = true;
            this.dispatchEvent( displayObject, 'mouseover', this.eventData );
        }

        if (displayObject.buttonMode)
        {
            this.cursor = displayObject.defaultCursor;
        }
    }
    else
    {
        if(displayObject._mouseOver)
        {
            displayObject._mouseOver = false;
            this.dispatchEvent( displayObject, 'mouseout', this.eventData);
        }
    }
};


/**
 * Is called when the pointer button is pressed down on the renderer element
 *
 * @param event {Event} The DOM event of a pointer button being pressed down
 * @private
 */
InteractionManager.prototype.onPointerDown = function (event)
{
    this.normalizeToPointerData( event );
    this.pointer.originalEvent = event;
    this.eventData.data = this.pointer;
    this.eventData.stopped = false;

    // Update internal pointer reference
    this.mapPositionToPoint( this.pointer.global, event.clientX, event.clientY);

    if (this.autoPreventDefault)
    {
        this.pointer.originalEvent.preventDefault();
    }

    this.processInteractive(this.pointer.global, this.renderer._lastObjectRendered, this.processPointerDown, true );
};

/**
 * Processes the result of the pointer down check and dispatches the event if need be
 *
 * @param displayObject {PIXI.Container|PIXI.Sprite|PIXI.extras.TilingSprite} The display object that was tested
 * @param hit {boolean} the result of the hit test on the display object
 * @private
 */
InteractionManager.prototype.processPointerDown = function ( displayObject, hit )
{
    if(hit)
    {
        displayObject._pointerDown = true;
        this.dispatchEvent( displayObject, 'pointerdown', this.eventData );
    }
};

/**
 * Is called when the pointer button is released on the renderer element
 *
 * @param event {Event} The DOM event of a pointer button being released
 * @private
 */
InteractionManager.prototype.onPointerUp = function (event)
{
    this.normalizeToPointerData( event );
    this.pointer.originalEvent = event;
    this.eventData.data = this.pointer;
    this.eventData.stopped = false;

    // Update internal pointer reference
    this.mapPositionToPoint( this.pointer.global, event.clientX, event.clientY);

    this.processInteractive(this.pointer.global, this.renderer._lastObjectRendered, this.processPointerUp, true );
};

/**
 * Processes the result of the pointer up check and dispatches the event if need be
 *
 * @param displayObject {PIXI.Container|PIXI.Sprite|PIXI.extras.TilingSprite} The display object that was tested
 * @param hit {boolean} the result of the hit test on the display object
 * @private
 */
InteractionManager.prototype.processPointerUp = function ( displayObject, hit )
{
    if(hit)
    {
        this.dispatchEvent( displayObject, 'pointerup', this.eventData );

        if( displayObject._pointerDown )
        {
            displayObject._pointerDown = false;
            this.dispatchEvent( displayObject, 'pointertap', this.eventData );
        }
    }
    else
    {
        if( displayObject._pointerDown )
        {
            displayObject._pointerDown = false;
            this.dispatchEvent( displayObject, 'pointerupoutside', this.eventData );
        }
    }
};

/**
 * Is called when the pointer moves across the renderer element
 *
 * @param event {Event} The DOM event of the pointer moving
 * @private
 */
InteractionManager.prototype.onPointerMove = function (event)
{
    this.normalizeToPointerData( event );
    this.pointer.originalEvent = event;
    this.eventData.data = this.pointer;
    this.eventData.stopped = false;

    this.mapPositionToPoint( this.pointer.global, event.clientX, event.clientY);

    this.processInteractive(this.pointer.global, this.renderer._lastObjectRendered, this.processPointerMove, true );
};

/**
 * Processes the result of the pointer move check and dispatches the event if need be
 *
 * @param displayObject {PIXI.Container|PIXI.Sprite|PIXI.extras.TilingSprite} The display object that was tested
 * @param hit {boolean} the result of the hit test on the display object
 * @private
 */
InteractionManager.prototype.processPointerMove = function ( displayObject, hit )
{
    if (!this.normalizingTouchEvents)
    {
        this.processPointerOverOut(displayObject, hit);
    }

    if(!this.moveWhenInside || hit)
    {
        this.dispatchEvent( displayObject, 'pointermove', this.eventData);
    }
};


/**
 * Is called when the pointer is moved out of the renderer element
 *
 * @param event {Event} The DOM event of a pointer being moved out
 * @private
 */
InteractionManager.prototype.onPointerOut = function (event)
{
    this.normalizeToPointerData( event );
    this.pointer.originalEvent = event;
    this.eventData.stopped = false;

    // Update internal pointer reference
    this.mapPositionToPoint( this.pointer.global, event.clientX, event.clientY);

    this.processInteractive( this.pointer.global, this.renderer._lastObjectRendered, this.processPointerOverOut, false );
};

/**
 * Processes the result of the pointer over/out check and dispatches the event if need be
 *
 * @param displayObject {PIXI.Container|PIXI.Sprite|PIXI.extras.TilingSprite} The display object that was tested
 * @param hit {boolean} the result of the hit test on the display object
 * @private
 */
InteractionManager.prototype.processPointerOverOut = function ( displayObject, hit )
{
    if(hit)
    {
        if(!displayObject._pointerOver)
        {
            displayObject._pointerOver = true;
            this.dispatchEvent( displayObject, 'pointerover', this.eventData );
        }
    }
    else
    {
        if(displayObject._pointerOver)
        {
            displayObject._pointerOver = false;
            this.dispatchEvent( displayObject, 'pointerout', this.eventData);
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
    if (this.autoPreventDefault)
    {
        event.preventDefault();
    }

    var changedTouches = event.changedTouches;
    var cLength = changedTouches.length;

    for (var i=0; i < cLength; i++)
    {
        var touchEvent = changedTouches[i];
        //TODO POOL
        var touchData = this.getTouchData( touchEvent );

        touchData.originalEvent = event;

        this.eventData.data = touchData;
        this.eventData.stopped = false;

        this.processInteractive( touchData.global, this.renderer._lastObjectRendered, this.processTouchStart, true );

        this.returnTouchData( touchData );
    }
};

/**
 * Processes the result of a touch check and dispatches the event if need be
 *
 * @param displayObject {PIXI.Container|PIXI.Sprite|PIXI.extras.TilingSprite} The display object that was tested
 * @param hit {boolean} the result of the hit test on the display object
 * @private
 */
InteractionManager.prototype.processTouchStart = function ( displayObject, hit )
{
    if(hit)
    {
        displayObject._touchDown = true;
        this.dispatchEvent( displayObject, 'touchstart', this.eventData );
    }
};


/**
 * Is called when a touch ends on the renderer element
 *
 * @param event {Event} The DOM event of a touch ending on the renderer view
 * @private
 */
InteractionManager.prototype.onTouchEnd = function (event)
{
    if (this.autoPreventDefault)
    {
        event.preventDefault();
    }

    var changedTouches = event.changedTouches;
    var cLength = changedTouches.length;

    for (var i=0; i < cLength; i++)
    {
        var touchEvent = changedTouches[i];

        var touchData = this.getTouchData( touchEvent );

        touchData.originalEvent = event;

        //TODO this should be passed along.. no set
        this.eventData.data = touchData;
        this.eventData.stopped = false;


        this.processInteractive( touchData.global, this.renderer._lastObjectRendered, this.processTouchEnd, true );

        this.returnTouchData( touchData );
    }
};

/**
 * Processes the result of the end of a touch and dispatches the event if need be
 *
 * @param displayObject {PIXI.Container|PIXI.Sprite|PIXI.extras.TilingSprite} The display object that was tested
 * @param hit {boolean} the result of the hit test on the display object
 * @private
 */
InteractionManager.prototype.processTouchEnd = function ( displayObject, hit )
{
    if(hit)
    {
        this.dispatchEvent( displayObject, 'touchend', this.eventData );

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

/**
 * Is called when a touch is moved across the renderer element
 *
 * @param event {Event} The DOM event of a touch moving across the renderer view
 * @private
 */
InteractionManager.prototype.onTouchMove = function (event)
{
    if (this.autoPreventDefault)
    {
        event.preventDefault();
    }

    var changedTouches = event.changedTouches;
    var cLength = changedTouches.length;

    for (var i=0; i < cLength; i++)
    {
        var touchEvent = changedTouches[i];

        var touchData = this.getTouchData( touchEvent );

        touchData.originalEvent = event;

        this.eventData.data = touchData;
        this.eventData.stopped = false;

        this.processInteractive( touchData.global, this.renderer._lastObjectRendered, this.processTouchMove, this.moveWhenInside );

        this.returnTouchData( touchData );
    }
};

/**
 * Processes the result of a touch move check and dispatches the event if need be
 *
 * @param displayObject {PIXI.Container|PIXI.Sprite|PIXI.extras.TilingSprite} The display object that was tested
 * @param hit {boolean} the result of the hit test on the display object
 * @private
 */
InteractionManager.prototype.processTouchMove = function ( displayObject, hit )
{
    if(!this.moveWhenInside || hit)
    {
        this.dispatchEvent( displayObject, 'touchmove', this.eventData);
    }
};

/**
 * Grabs an interaction data object from the internal pool
 *
 * @param touchEvent {object} The touch event we need to pair with an interactionData object
 *
 * @private
 */
InteractionManager.prototype.getTouchData = function (touchEvent)
{
    var touchData = this.interactiveDataPool.pop();

    if(!touchData)
    {
        touchData = new InteractionData();
    }

    touchData.identifier = touchEvent.identifier;
    this.mapPositionToPoint( touchData.global, touchEvent.clientX, touchEvent.clientY );

    if(navigator.isCocoonJS)
    {
        touchData.global.x = touchData.global.x / this.resolution;
        touchData.global.y = touchData.global.y / this.resolution;
    }

    touchEvent.globalX = touchData.global.x;
    touchEvent.globalY = touchData.global.y;

    return touchData;
};

/**
 * Returns an interaction data object to the internal pool
 *
 * @param touchData {PIXI.interaction.InteractionData} The touch data object we want to return to the pool
 *
 * @private
 */
InteractionManager.prototype.returnTouchData = function ( touchData )
{
    this.interactiveDataPool.push( touchData );
};

/**
 * Ensures that the original event object contains all data that a regular pointer event would have
 *
 * @param event {Object} The original event data from a touch or mouse event
 *
 * @private
 */
InteractionManager.prototype.normalizeToPointerData = function (event)
{
    if (this.normalizingTouchEvents)
    {
        event.button = event.touches.length ? 1 : 0;
        event.buttons = event.touches.length ? 1 : 0;
        event.isPrimary = event.touches.length === 1;
        event.width = event.changedTouches[0].radiusX || 1;
        event.height = event.changedTouches[0].radiusY || 1;
        event.tiltX = 0;
        event.tiltY = 0;
        event.pointerType = 'touch';
        event.pointerId = event.touches.length;
        event.pressure = event.changedTouches[0].force || 0.5;
        event.rotation = event.changedTouches[0].rotationAngle || 0;

        event.clientX = event.changedTouches[0].clientX;
        event.clientY = event.changedTouches[0].clientY;
        event.pageX = event.changedTouches[0].pageX;
        event.pageY = event.changedTouches[0].pageY;
        event.screenX = event.changedTouches[0].screenX;
        event.screenY = event.changedTouches[0].screenY;
        event.layerX = event.offsetX = event.clientX;
        event.layerY = event.offsetY = event.clientY;
    }
    else if (this.normalizingMouseEvents)
    {
        event.isPrimary = true;
        event.width = 1;
        event.height = 1;
        event.tiltX = 0;
        event.tiltY = 0;
        event.pointerType = 'mouse';
        event.pointerId = 1;
        event.pressure = 0.5;
        event.rotation = 0;
    }
};

/**
 * Destroys the interaction manager
 *
 */
InteractionManager.prototype.destroy = function () {
    this.removeEvents();

    this.renderer = null;

    this.mouse = null;

    this.eventData = null;

    this.interactiveDataPool = null;

    this.interactionDOMElement = null;

    this.onMouseDown = null;
    this.processMouseDown = null;

    this.onMouseUp = null;
    this.processMouseUp = null;

    this.onMouseMove = null;
    this.processMouseMove = null;

    this.onMouseOut = null;
    this.processMouseOverOut = null;

    this.onPointerDown = null;
    this.processPointerDown = null;

    this.onPointerUp = null;
    this.processPointerUp = null;

    this.onPointerMove = null;
    this.processPointerMove = null;

    this.onPointerOut = null;
    this.processPointerOverOut = null;

    this.onTouchStart = null;
    this.processTouchStart = null;

    this.onTouchEnd = null;
    this.processTouchEnd = null;

    this.onTouchMove = null;
    this.processTouchMove = null;

    this._tempPoint = null;
};

core.WebGLRenderer.registerPlugin('interaction', InteractionManager);
core.CanvasRenderer.registerPlugin('interaction', InteractionManager);
