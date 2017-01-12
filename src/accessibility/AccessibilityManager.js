import * as core from '../core';
import Device from 'ismobilejs';
import accessibleTarget from './accessibleTarget';

// add some extra variables to the container..
Object.assign(
    core.DisplayObject.prototype,
    accessibleTarget
);

const KEY_CODE_TAB = 9;

const DIV_TOUCH_SIZE = 100;
const DIV_TOUCH_POS_X = 0;
const DIV_TOUCH_POS_Y = 0;
const DIV_TOUCH_ZINDEX = 2;

const DIV_HOOK_SIZE = 1;
const DIV_HOOK_POS_X = -1000;
const DIV_HOOK_POS_Y = -1000;
const DIV_HOOK_ZINDEX = 2;

/**
 * The Accessibility manager reacreates the ability to tab and and have content read by screen
 * readers. This is very important as it can possibly help people with disabilities access pixi
 * content.
 *
 * Much like interaction any DisplayObject can be made accessible. This manager will map the
 * events as if the mouse was being used, minimizing the efferot required to implement.
 *
 * An instance of this class is automatically created by default, and can be found at renderer.plugins.accessibility
 *
 * @class
 * @memberof PIXI
 */
export default class AccessibilityManager
{
    /**
     * @param {PIXI.CanvasRenderer|PIXI.WebGLRenderer} renderer - A reference to the current renderer
     */
    constructor(renderer)
    {
        // first we create a div that will sit over the pixi element. This is where the div overlays will go.
        const div = document.createElement('div');

        div.style.width = `${DIV_TOUCH_SIZE}px`;
        div.style.height = `${DIV_TOUCH_SIZE}px`;
        div.style.position = 'absolute';
        div.style.top = `${DIV_TOUCH_POS_X}px`;
        div.style.left = `${DIV_TOUCH_POS_Y}px`;
        div.style.zIndex = DIV_TOUCH_ZINDEX;

        /**
         * This is the dom element that will sit over the pixi element. This is where the div overlays will go.
         *
         * @type {HTMLElement}
         * @private
         */
        this.div = div;

        /**
         * A simple pool for storing divs.
         *
         * @type {*}
         * @private
         */
        this.pool = [];

        /**
         * This is a tick used to check if an object is no longer being rendered.
         *
         * @type {Number}
         * @private
         */
        this.renderId = 0;

        /**
         * Setting this to true will visually show the divs
         *
         * @type {boolean}
         */
        this.debug = false;

        /**
         * The renderer this accessibility manager works for.
         *
         * @member {PIXI.SystemRenderer}
         */
        this.renderer = renderer;

        /**
         * The array of currently active accessible items.
         *
         * @member {Array<*>}
         * @private
         */
        this.children = [];

        /**
         * pre-bind the functions
         *
         * @private
         */
        this._onKeyDown = this._onKeyDown.bind(this);
        this._onMouseMove = this._onMouseMove.bind(this);

        /**
         * stores the state of the manager. If there are no accessible objects or the mouse is moving the will be false.
         *
         * @member {Array<*>}
         * @private
         */
        this.isActive = false;
        this.isMobileAccessabillity = false;
        this.isAlwaysOn = false;

        // let listen for tab.. once pressed we can fire up and show the accessibility layer
        window.addEventListener('keydown', this._onKeyDown, false);

        // check for mobile specific solutions
        if (this.isMobileDevice())
        {
            if (this.hasFocusEvents())
            {
                this.createTouchHook();
            }
            else
            {
                this.alwaysOn();
            }
        }
    }

    /**
     * some mobile devices fire Focus Events in accessibility mode eg. IOS Voiceover
     * other mobile devices do not fire Focus Events eg. Android Talkback or Kindle Fire VoiceView
     * default to false unless tested
      * @return {Boolean} true if Focus Events are fired on this device
     */
    hasFocusEvents()
    {
        // at the moment only true for apple IOS
        return (Device.apple.device);
    }

    /**
     * determines if we need to add the accessibility divs for mobile touch
     * @return {Boolean} true if divs are needed
     */
    isMobileDevice()
    {
        return (Device.tablet || Device.phone) && !navigator.isCocoonJS;
    }

    /**
     * Divs must be created and always on top
     * @return {void}
     */
    alwaysOn()
    {
        this.isAlwaysOn = true;

        // render is undefined until the next tick
        setTimeout(this.activate.bind(this));
    }

    /**
     * Creates the touch hooks.
     *
     */
    createTouchHook()
    {
        const hookDiv = document.createElement('button');

        hookDiv.style.width = `${DIV_HOOK_SIZE}px`;
        hookDiv.style.height = `${DIV_HOOK_SIZE}px`;
        hookDiv.style.position = 'absolute';
        hookDiv.style.top = `${DIV_HOOK_POS_X}px`;
        hookDiv.style.left = `${DIV_HOOK_POS_Y}px`;
        hookDiv.style.zIndex = DIV_HOOK_ZINDEX;
        hookDiv.style.backgroundColor = '#FF0000';
        hookDiv.title = 'HOOK DIV';

        hookDiv.addEventListener('focus', () =>
        {
            this.isMobileAccessabillity = true;
            this.activate();
            document.body.removeChild(hookDiv);
        });

        document.body.appendChild(hookDiv);
    }

    /**
     * Activating will cause the Accessibility layer to be shown. This is called when a user
     * preses the tab key
     *
     * @private
     */
    activate()
    {
        if (this.isActive)
        {
            return;
        }

        this.isActive = true;

        window.document.addEventListener('mousemove', this._onMouseMove, true);
        window.removeEventListener('keydown', this._onKeyDown, false);

        this.renderer.on('postrender', this.update, this);

        if (this.renderer.view.parentNode)
        {
            this.renderer.view.parentNode.appendChild(this.div);
        }
    }

    /**
     * Deactivating will cause the Accessibility layer to be hidden. This is called when a user moves
     * the mouse
     *
     * @private
     */
    deactivate()
    {
        if (!this.isActive || this.isMobileAccessabillity)
        {
            return;
        }

        this.isActive = false;

        window.document.removeEventListener('mousemove', this._onMouseMove);
        window.addEventListener('keydown', this._onKeyDown, false);

        this.renderer.off('postrender', this.update);

        if (this.div.parentNode)
        {
            this.div.parentNode.removeChild(this.div);
        }
    }

    /**
     * This recursive function will run throught he scene graph and add any new accessible objects to the DOM layer.
     *
     * @private
     * @param {PIXI.Container} displayObject - The DisplayObject to check.
     */
    updateAccessibleObjects(displayObject)
    {
        if (!displayObject.visible)
        {
            return;
        }

        if (displayObject.accessible && displayObject.interactive)
        {
            if (!displayObject._accessibleActive)
            {
                this.addChild(displayObject);
            }

            displayObject.renderId = this.renderId;
        }

        const children = displayObject.children;

        for (let i = children.length - 1; i >= 0; i--)
        {
            this.updateAccessibleObjects(children[i]);
        }
    }

     /**
     * Sort children by tab index
     * The divs seem to tab in order of being added as a child regardless of the tab order set
     * This sorts the children whenever a new one is set
     * @param  {DOMElement} element the one which will have children sorted.
     *
     * @private
     */
    updateTabOrders()
    {
        if (!this._tabOrderDirty)
        {
            return;
        }

        const element = this.div;
        const children = element.childNodes;

        let list = [];

        for (let i = 0; i < children.length; i++)
        {
            if (children[i].nodeType === 1)
            {
                list.push(children[i]);
            }
        }

        let ta = 0;
        let tb = 0;

        list = list.sort(
            function sort(a, b)
            {
                ta = a.getAttribute('tabindex');
                tb = b.getAttribute('tabindex');

                if (ta === tb)
                {
                    return 0;
                }

                return tb > ta ? -1 : 1;
            }
        );

        for (let j = 0; j < list.length; j++)
        {
            element.appendChild(list[j]);
        }

        this._tabOrderDirty = false;
    }

    /**
     * Before each render this function will ensure that all divs are mapped correctly to their DisplayObjects.
     *
     * @private
     */
    update()
    {
        if (!this.renderer.renderingToScreen)
        {
            return;
        }

        // update children...
        this.updateAccessibleObjects(this.renderer._lastObjectRendered);

        // sort out tab orders...
        this.updateTabOrders();

        const rect = this.renderer.view.getBoundingClientRect();
        const sx = rect.width / this.renderer.width;
        const sy = rect.height / this.renderer.height;

        let div = this.div;

        div.style.left = `${rect.left}px`;
        div.style.top = `${rect.top}px`;
        div.style.width = `${this.renderer.width}px`;
        div.style.height = `${this.renderer.height}px`;

        for (let i = 0; i < this.children.length; i++)
        {
            const child = this.children[i];

            if (child.renderId !== this.renderId)
            {
                child._accessibleActive = false;

                core.utils.removeItems(this.children, i, 1);
                this.div.removeChild(child._accessibleDiv);
                this.pool.push(child._accessibleDiv);
                child._accessibleDiv = null;

                i--;

                if (this.children.length === 0)
                {
                    this.deactivate();
                }
            }
            else
            {
                // map div to display..
                div = child._accessibleDiv;
                let hitArea = child.hitArea;
                const wt = child.worldTransform;

                if (child.hitArea)
                {
                    div.style.left = `${(wt.tx + (hitArea.x * wt.a)) * sx}px`;
                    div.style.top = `${(wt.ty + (hitArea.y * wt.d)) * sy}px`;

                    div.style.width = `${hitArea.width * wt.a * sx}px`;
                    div.style.height = `${hitArea.height * wt.d * sy}px`;
                }
                else
                {
                    hitArea = child.getBounds();

                    this.capHitArea(hitArea);

                    div.style.left = `${hitArea.x * sx}px`;
                    div.style.top = `${hitArea.y * sy}px`;

                    div.style.width = `${hitArea.width * sx}px`;
                    div.style.height = `${hitArea.height * sy}px`;
                }
            }
        }

        // increment the render id..
        this.renderId++;
    }

    /**
     * TODO: docs.
     *
     * @param {Rectangle} hitArea - TODO docs
     */
    capHitArea(hitArea)
    {
        if (hitArea.x < 0)
        {
            hitArea.width += hitArea.x;
            hitArea.x = 0;
        }

        if (hitArea.y < 0)
        {
            hitArea.height += hitArea.y;
            hitArea.y = 0;
        }

        if (hitArea.x + hitArea.width > this.renderer.width)
        {
            hitArea.width = this.renderer.width - hitArea.x;
        }

        if (hitArea.y + hitArea.height > this.renderer.height)
        {
            hitArea.height = this.renderer.height - hitArea.y;
        }
    }

    /**
     * Adds a DisplayObject to the accessibility manager
     *
     * @private
     * @param {DisplayObject} displayObject - The child to make accessible.
     */
    addChild(displayObject)
    {
        //    this.activate();

        let div = this.pool.pop();

        if (!div)
        {
            div = document.createElement('button');

            div.style.width = `${DIV_TOUCH_SIZE}px`;
            div.style.height = `${DIV_TOUCH_SIZE}px`;
            div.style.backgroundColor = this.debug ? 'rgba(255,0,0,0.5)' : 'transparent';
            div.style.position = 'absolute';
            div.style.zIndex = DIV_TOUCH_ZINDEX;
            div.style.borderStyle = 'none';

            if (this.isAlwaysOn)
            {
                // remove the focus highlight from the div
                // so you cannot see the hidden div during normal touch
                div.style['-webkit-tap-highlight-color'] = 'rgba(0,0,0,0)';
                div.style.border = 0;
                div.style.outline = 'none';
            }

            div.addEventListener('click', this._onClick.bind(this));
            div.addEventListener('focus', this._onFocus.bind(this));
            div.addEventListener('focusout', this._onFocusOut.bind(this));
        }

        if (displayObject.accessibleTitle)
        {
            div.title = displayObject.accessibleTitle;
        }
        else if (!displayObject.accessibleTitle && !displayObject.accessibleHint)
        {
            div.title = `displayObject ${this.tabIndex}`;
        }

        if (displayObject.accessibleHint)
        {
            div.setAttribute('aria-label', displayObject.accessibleHint);
        }

        //

        displayObject._accessibleActive = true;
        displayObject._accessibleDiv = div;
        div.displayObject = displayObject;

        this.children.push(displayObject);
        this.div.appendChild(displayObject._accessibleDiv);
        displayObject._accessibleDiv.tabIndex = displayObject.tabIndex;

        // set this to true so we know to sort the tab order of the divs
        this._tabOrderDirty = true;
    }

    /**
     * Maps the div button press to pixi's InteractionManager (click)
     *
     * @private
     * @param {MouseEvent} e - The click event.
     */
    _onClick(e)
    {
        const interactionManager = this.renderer.plugins.interaction;

        interactionManager.dispatchEvent(e.target.displayObject, 'click', interactionManager.eventData);
    }

    /**
     * Maps the div focus events to pixis InteractionManager (mouseover)
     *
     * @private
     * @param {FocusEvent} e - The focus event.
     */
    _onFocus(e)
    {
        const interactionManager = this.renderer.plugins.interaction;

        interactionManager.dispatchEvent(e.target.displayObject, 'mouseover', interactionManager.eventData);
    }

    /**
     * Maps the div focus events to pixis InteractionManager (mouseout)
     *
     * @private
     * @param {FocusEvent} e - The focusout event.
     */
    _onFocusOut(e)
    {
        const interactionManager = this.renderer.plugins.interaction;

        interactionManager.dispatchEvent(e.target.displayObject, 'mouseout', interactionManager.eventData);
    }

    /**
     * Is called when a key is pressed
     *
     * @private
     * @param {KeyboardEvent} e - The keydown event.
     */
    _onKeyDown(e)
    {
        if (e.keyCode !== KEY_CODE_TAB)
        {
            return;
        }

        this.activate();
    }

    /**
     * Is called when the mouse moves across the renderer element
     *
     * @private
     */
    _onMouseMove()
    {
        this.deactivate();
    }

    /**
     * Destroys the accessibility manager
     *
     */
    destroy()
    {
        this.div = null;

        for (let i = 0; i < this.children.length; i++)
        {
            this.children[i].div = null;
        }

        window.document.removeEventListener('mousemove', this._onMouseMove);
        window.removeEventListener('keydown', this._onKeyDown);

        this.pool = null;
        this.children = null;
        this.renderer = null;
    }
}

core.WebGLRenderer.registerPlugin('accessibility', AccessibilityManager);
core.CanvasRenderer.registerPlugin('accessibility', AccessibilityManager);
