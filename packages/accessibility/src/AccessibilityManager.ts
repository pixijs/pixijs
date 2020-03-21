import { DisplayObject } from '@pixi/display';
import { isMobile, removeItems } from '@pixi/utils';
import { accessibleTarget } from './accessibleTarget';

import type { Rectangle } from '@pixi/math';
import type { Container } from '@pixi/display';
import type { Renderer, AbstractRenderer } from '@pixi/core';
import type { IAccessibleHTMLElement } from './accessibleTarget';

// add some extra variables to the container..
DisplayObject.mixin(accessibleTarget);

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
 * The Accessibility manager recreates the ability to tab and have content read by screen readers.
 * This is very important as it can possibly help people with disabilities access PixiJS content.
 *
 * A DisplayObject can be made accessible just like it can be made interactive. This manager will map the
 * events as if the mouse was being used, minimizing the effort required to implement.
 *
 * An instance of this class is automatically created by default, and can be found at `renderer.plugins.accessibility`
 *
 * @class
 * @memberof PIXI.accessibility
 */
export class AccessibilityManager
{
    public debug: boolean;
    public renderer: AbstractRenderer|Renderer;

    private _isActive: boolean;
    private _isMobileAccessibility: boolean;
    private _hookDiv: HTMLElement;
    private div: HTMLElement;
    private pool: IAccessibleHTMLElement[];
    private renderId: number;
    private children: DisplayObject[];
    private androidUpdateCount: number;
    private androidUpdateFrequency: number;

    /**
     * @param {PIXI.CanvasRenderer|PIXI.Renderer} renderer - A reference to the current renderer
     */
    constructor(renderer: AbstractRenderer|Renderer)
    {
        /**
         * @type {?HTMLElement}
         * @private
         */
        this._hookDiv = null;

        if (isMobile.tablet || isMobile.phone)
        {
            this.createTouchHook();
        }

        // first we create a div that will sit over the PixiJS element. This is where the div overlays will go.
        const div = document.createElement('div');

        div.style.width = `${DIV_TOUCH_SIZE}px`;
        div.style.height = `${DIV_TOUCH_SIZE}px`;
        div.style.position = 'absolute';
        div.style.top = `${DIV_TOUCH_POS_X}px`;
        div.style.left = `${DIV_TOUCH_POS_Y}px`;
        div.style.zIndex = DIV_TOUCH_ZINDEX.toString();

        /**
         * This is the dom element that will sit over the PixiJS element. This is where the div overlays will go.
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
         * Setting this to true will visually show the divs.
         *
         * @type {boolean}
         */
        this.debug = false;

        /**
         * The renderer this accessibility manager works for.
         *
         * @member {PIXI.AbstractRenderer}
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
         * @type {Function}
         * @private
         */
        this._onKeyDown = this._onKeyDown.bind(this);

        /**
         * pre-bind the functions
         *
         * @type {Function}
         * @private
         */
        this._onMouseMove = this._onMouseMove.bind(this);

        this._isActive = false;

        this._isMobileAccessibility = false;

        /**
         * count to throttle div updates on android devices
         * @type number
         * @private
         */
        this.androidUpdateCount = 0;

        /**
         * the frequency to update the div elements ()
         * @private
         */
        this.androidUpdateFrequency = 500; // 2fps

        // let listen for tab.. once pressed we can fire up and show the accessibility layer
        window.addEventListener('keydown', this._onKeyDown, false);
    }

    /**
     * A flag
     * @member {boolean}
     * @readonly
     */
    get isActive(): boolean
    {
        return this._isActive;
    }

    /**
     * A flag
     * @member {boolean}
     * @readonly
     */
    get isMobileAccessibility(): boolean
    {
        return this._isMobileAccessibility;
    }

    /**
     * Creates the touch hooks.
     *
     * @private
     */
    private createTouchHook(): void
    {
        const hookDiv = document.createElement('button');

        hookDiv.style.width = `${DIV_HOOK_SIZE}px`;
        hookDiv.style.height = `${DIV_HOOK_SIZE}px`;
        hookDiv.style.position = 'absolute';
        hookDiv.style.top = `${DIV_HOOK_POS_X}px`;
        hookDiv.style.left = `${DIV_HOOK_POS_Y}px`;
        hookDiv.style.zIndex = DIV_HOOK_ZINDEX.toString();
        hookDiv.style.backgroundColor = '#FF0000';
        hookDiv.title = 'select to enable accessability for this content';

        hookDiv.addEventListener('focus', () =>
        {
            this._isMobileAccessibility = true;
            this.activate();
            this.destroyTouchHook();
        });

        document.body.appendChild(hookDiv);
        this._hookDiv = hookDiv;
    }

    /**
     * Destroys the touch hooks.
     *
     * @private
     */
    private destroyTouchHook(): void
    {
        if (!this._hookDiv)
        {
            return;
        }
        document.body.removeChild(this._hookDiv);
        this._hookDiv = null;
    }

    /**
     * Activating will cause the Accessibility layer to be shown.
     * This is called when a user presses the tab key.
     *
     * @private
     */
    private activate(): void
    {
        if (this._isActive)
        {
            return;
        }

        this._isActive = true;

        window.document.addEventListener('mousemove', this._onMouseMove, true);
        window.removeEventListener('keydown', this._onKeyDown, false);

        // TODO: Remove casting when CanvasRenderer is converted
        (this.renderer as AbstractRenderer).on('postrender', this.update, this);

        if ((this.renderer as AbstractRenderer).view.parentNode)
        {
            (this.renderer as AbstractRenderer).view.parentNode.appendChild(this.div);
        }
    }

    /**
     * Deactivating will cause the Accessibility layer to be hidden.
     * This is called when a user moves the mouse.
     *
     * @private
     */
    private deactivate(): void
    {
        if (!this._isActive || this._isMobileAccessibility)
        {
            return;
        }

        this._isActive = false;

        window.document.removeEventListener('mousemove', this._onMouseMove, true);
        window.addEventListener('keydown', this._onKeyDown, false);

        // TODO: Remove casting when CanvasRenderer is converted
        (this.renderer as AbstractRenderer).off('postrender', this.update);

        if (this.div.parentNode)
        {
            this.div.parentNode.removeChild(this.div);
        }
    }

    /**
     * This recursive function will run through the scene graph and add any new accessible objects to the DOM layer.
     *
     * @private
     * @param {PIXI.Container} displayObject - The DisplayObject to check.
     */
    private updateAccessibleObjects(displayObject: Container): void
    {
        if (!displayObject.visible || !displayObject.accessibleChildren)
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

        for (let i = 0; i < children.length; i++)
        {
            this.updateAccessibleObjects(children[i] as Container);
        }
    }

    /**
     * Before each render this function will ensure that all divs are mapped correctly to their DisplayObjects.
     *
     * @private
     */
    private update(): void
    {
        /* On Android default web browser, tab order seems to be calculated by position rather than tabIndex,
        *  moving buttons can cause focus to flicker between two buttons making it hard/impossible to navigate,
        *  so I am just running update every half a second, seems to fix it.
        */
        const now = performance.now();

        if (isMobile.android.device && now < this.androidUpdateCount)
        {
            return;
        }

        this.androidUpdateCount = now + this.androidUpdateFrequency;

        if (!(this.renderer as Renderer).renderingToScreen)
        {
            return;
        }

        // update children...
        this.updateAccessibleObjects(this.renderer._lastObjectRendered as Container);

        // TODO: Remove casting when CanvasRenderer is converted
        const rect = (this.renderer as AbstractRenderer).view.getBoundingClientRect();

        const resolution = this.renderer.resolution;

        const sx = (rect.width / (this.renderer as AbstractRenderer).width) * resolution;
        const sy = (rect.height / (this.renderer as AbstractRenderer).height) * resolution;

        let div = this.div;

        div.style.left = `${rect.left}px`;
        div.style.top = `${rect.top}px`;
        div.style.width = `${(this.renderer as AbstractRenderer).width}px`;
        div.style.height = `${(this.renderer as AbstractRenderer).height}px`;

        for (let i = 0; i < this.children.length; i++)
        {
            const child = this.children[i];

            if (child.renderId !== this.renderId)
            {
                child._accessibleActive = false;

                removeItems(this.children, i, 1);
                this.div.removeChild(child._accessibleDiv);
                this.pool.push(child._accessibleDiv);
                child._accessibleDiv = null;

                i--;
            }
            else
            {
                // map div to display..
                div = child._accessibleDiv;
                let hitArea = child.hitArea as Rectangle;
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

                    // update button titles and hints if they exist and they've changed
                    if (div.title !== child.accessibleTitle && child.accessibleTitle !== null)
                    {
                        div.title = child.accessibleTitle;
                    }
                    if (div.getAttribute('aria-label') !== child.accessibleHint
                        && child.accessibleHint !== null)
                    {
                        div.setAttribute('aria-label', child.accessibleHint);
                    }
                }

                // the title or index may have changed, if so lets update it!
                if (child.accessibleTitle !== div.title || child.tabIndex !== div.tabIndex)
                {
                    div.title = child.accessibleTitle;
                    div.tabIndex = child.tabIndex;
                    if (this.debug) this.updateDebugHTML(div);
                }
            }
        }

        // increment the render id..
        this.renderId++;
    }

    /**
     * private function that will visually add the information to the
     * accessability div
     *
     * @param {HTMLElement} div
     */
    public updateDebugHTML(div: IAccessibleHTMLElement): void
    {
        div.innerHTML = `type: ${div.type}</br> title : ${div.title}</br> tabIndex: ${div.tabIndex}`;
    }

    /**
     * Adjust the hit area based on the bounds of a display object
     *
     * @param {PIXI.Rectangle} hitArea - Bounds of the child
     */
    public capHitArea(hitArea: Rectangle): void
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

        // TODO: Remove casting when CanvasRenderer is converted
        if (hitArea.x + hitArea.width > (this.renderer as AbstractRenderer).width)
        {
            hitArea.width = (this.renderer as AbstractRenderer).width - hitArea.x;
        }

        if (hitArea.y + hitArea.height > (this.renderer as AbstractRenderer).height)
        {
            hitArea.height = (this.renderer as AbstractRenderer).height - hitArea.y;
        }
    }

    /**
     * Adds a DisplayObject to the accessibility manager
     *
     * @private
     * @param {PIXI.DisplayObject} displayObject - The child to make accessible.
     */
    private addChild<T extends DisplayObject>(displayObject: T): void
    {
        //    this.activate();

        let div = this.pool.pop();

        if (!div)
        {
            div = document.createElement('button');

            div.style.width = `${DIV_TOUCH_SIZE}px`;
            div.style.height = `${DIV_TOUCH_SIZE}px`;
            div.style.backgroundColor = this.debug ? 'rgba(255,255,255,0.5)' : 'transparent';
            div.style.position = 'absolute';
            div.style.zIndex = DIV_TOUCH_ZINDEX.toString();
            div.style.borderStyle = 'none';

            // ARIA attributes ensure that button title and hint updates are announced properly
            if (navigator.userAgent.toLowerCase().indexOf('chrome') > -1)
            {
                // Chrome doesn't need aria-live to work as intended; in fact it just gets more confused.
                div.setAttribute('aria-live', 'off');
            }
            else
            {
                div.setAttribute('aria-live', 'polite');
            }

            if (navigator.userAgent.match(/rv:.*Gecko\//))
            {
                // FireFox needs this to announce only the new button name
                div.setAttribute('aria-relevant', 'additions');
            }
            else
            {
                // required by IE, other browsers don't much care
                div.setAttribute('aria-relevant', 'text');
            }

            div.addEventListener('click', this._onClick.bind(this));
            div.addEventListener('focus', this._onFocus.bind(this));
            div.addEventListener('focusout', this._onFocusOut.bind(this));
        }

        // set pointer events
        div.style.pointerEvents = displayObject.accessiblePointerEvents;
        // set the type, this defaults to button!
        div.type = displayObject.accessibleType;

        if (displayObject.accessibleTitle && displayObject.accessibleTitle !== null)
        {
            div.title = displayObject.accessibleTitle;
        }
        else if (!displayObject.accessibleHint
                 || displayObject.accessibleHint === null)
        {
            div.title = `displayObject ${displayObject.tabIndex}`;
        }

        if (displayObject.accessibleHint
            && displayObject.accessibleHint !== null)
        {
            div.setAttribute('aria-label', displayObject.accessibleHint);
        }

        if (this.debug) this.updateDebugHTML(div);

        displayObject._accessibleActive = true;
        displayObject._accessibleDiv = div;
        div.displayObject = displayObject;

        this.children.push(displayObject);
        this.div.appendChild(displayObject._accessibleDiv);
        displayObject._accessibleDiv.tabIndex = displayObject.tabIndex;
    }

    /**
     * Maps the div button press to pixi's InteractionManager (click)
     *
     * @private
     * @param {MouseEvent} e - The click event.
     */
    private _onClick(e: MouseEvent): void
    {
        // TODO: Remove casting when CanvasRenderer is converted
        const interactionManager = (this.renderer as AbstractRenderer).plugins.interaction;

        interactionManager.dispatchEvent(
            (e.target as IAccessibleHTMLElement).displayObject, 'click', interactionManager.eventData
        );
        interactionManager.dispatchEvent(
            (e.target as IAccessibleHTMLElement).displayObject, 'pointertap', interactionManager.eventData
        );
        interactionManager.dispatchEvent(
            (e.target as IAccessibleHTMLElement).displayObject, 'tap', interactionManager.eventData
        );
    }

    /**
     * Maps the div focus events to pixi's InteractionManager (mouseover)
     *
     * @private
     * @param {FocusEvent} e - The focus event.
     */
    private _onFocus(e: FocusEvent): void
    {
        if (!(e.target as Element).getAttribute('aria-live'))
        {
            (e.target as Element).setAttribute('aria-live', 'assertive');
        }

        // TODO: Remove casting when CanvasRenderer is converted
        const interactionManager = (this.renderer as AbstractRenderer).plugins.interaction;

        interactionManager.dispatchEvent(
            (e.target as IAccessibleHTMLElement).displayObject, 'mouseover', interactionManager.eventData
        );
    }

    /**
     * Maps the div focus events to pixi's InteractionManager (mouseout)
     *
     * @private
     * @param {FocusEvent} e - The focusout event.
     */
    private _onFocusOut(e: FocusEvent): void
    {
        if (!(e.target as Element).getAttribute('aria-live'))
        {
            (e.target as Element).setAttribute('aria-live', 'polite');
        }

        // TODO: Remove casting when CanvasRenderer is converted
        const interactionManager = (this.renderer as AbstractRenderer).plugins.interaction;

        interactionManager.dispatchEvent((e.target as any).displayObject, 'mouseout', interactionManager.eventData);
    }

    /**
     * Is called when a key is pressed
     *
     * @private
     * @param {KeyboardEvent} e - The keydown event.
     */
    private _onKeyDown(e: KeyboardEvent): void
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
     * @param {MouseEvent} e - The mouse event.
     */
    private _onMouseMove(e: MouseEvent): void
    {
        if (e.movementX === 0 && e.movementY === 0)
        {
            return;
        }

        this.deactivate();
    }

    /**
     * Destroys the accessibility manager
     *
     */
    public destroy(): void
    {
        this.destroyTouchHook();
        this.div = null;

        window.document.removeEventListener('mousemove', this._onMouseMove, true);
        window.removeEventListener('keydown', this._onKeyDown);

        this.pool = null;
        this.children = null;
        this.renderer = null;
    }
}
