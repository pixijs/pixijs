import { FederatedEvent } from '../events/FederatedEvent';
import { ExtensionType } from '../extensions/Extensions';
import { isMobile } from '../utils/browser/isMobile';
import { removeItems } from '../utils/data/removeItems';
import { type AccessibleHTMLElement } from './accessibilityTarget';

import type { Rectangle } from '../maths/shapes/Rectangle';
import type { System } from '../rendering/renderers/shared/system/System';
import type { Renderer } from '../rendering/renderers/types';
import type { Container } from '../scene/container/Container';
import type { isMobileResult } from '../utils/browser/isMobile';

/**
 * The accessibility module recreates the ability to tab and have content read by screen readers.
 * This is very important as it can possibly help people with disabilities access PixiJS content.
 *
 * This module is a mixin for {@link AbstractRenderer} and will need to be imported if you are managing your own renderer.
 * Usage:
 * ```js
 * import 'pixi.js/accessibility';
 * ```
 * To make an object accessible do the following:
 * ```js
 * container.accessible = true; // object is now accessible to screen readers!
 * ```
 * See {@link accessibility.AccessibleOptions} for more accessibility related properties that can be set.
 * @namespace accessibility
 */

/** @ignore */
const KEY_CODE_TAB = 9;

const DIV_TOUCH_SIZE = 100;
const DIV_TOUCH_POS_X = 0;
const DIV_TOUCH_POS_Y = 0;
const DIV_TOUCH_ZINDEX = 2;

const DIV_HOOK_SIZE = 1;
const DIV_HOOK_POS_X = -1000;
const DIV_HOOK_POS_Y = -1000;
const DIV_HOOK_ZINDEX = 2;

/** @ignore */
export interface AccessibilityOptions
{
    /** Setting this to true will visually show the divs. */
    debug?: boolean;
}

/**
 * The Accessibility system recreates the ability to tab and have content read by screen readers.
 * This is very important as it can possibly help people with disabilities access PixiJS content.
 *
 * A Container can be made accessible just like it can be made interactive. This manager will map the
 * events as if the mouse was being used, minimizing the effort required to implement.
 *
 * An instance of this class is automatically created by default, and can be found at `renderer.accessibility`
 * @memberof accessibility
 */
export class AccessibilitySystem implements System<AccessibilityOptions>
{
    /** @ignore */
    public static extension = {
        type: [
            ExtensionType.WebGLSystem,
            ExtensionType.WebGPUSystem,
        ],
        name: 'accessibility',
    } as const;

    /** Setting this to true will visually show the divs. */
    public debug = false;

    /**
     * The renderer this accessibility manager works for.
     * @type {WebGLRenderer|WebGPURenderer}
     */
    private _renderer: Renderer;

    /** Internal variable, see isActive getter. */
    private _isActive = false;

    /** Internal variable, see isMobileAccessibility getter. */
    private _isMobileAccessibility = false;

    /** Button element for handling touch hooks. */
    private _hookDiv: HTMLElement | null;

    /** This is the dom element that will sit over the PixiJS element. This is where the div overlays will go. */
    private _div: HTMLElement;

    /** A simple pool for storing divs. */
    private _pool: AccessibleHTMLElement[] = [];

    /** This is a tick used to check if an object is no longer being rendered. */
    private _renderId = 0;

    /** The array of currently active accessible items. */
    private _children: Container[] = [];

    /** Count to throttle div updates on android devices. */
    private _androidUpdateCount = 0;

    /**  The frequency to update the div elements. */
    private readonly _androidUpdateFrequency = 500; // 2fps

    // eslint-disable-next-line jsdoc/require-param
    /**
     * @param {WebGLRenderer|WebGPURenderer} renderer - A reference to the current renderer
     */
    constructor(renderer: Renderer, private readonly _mobileInfo: isMobileResult = isMobile)
    {
        this._hookDiv = null;

        if (_mobileInfo.tablet || _mobileInfo.phone)
        {
            this._createTouchHook();
        }

        // first we create a div that will sit over the PixiJS element. This is where the div overlays will go.
        const div = document.createElement('div');

        div.style.width = `${DIV_TOUCH_SIZE}px`;
        div.style.height = `${DIV_TOUCH_SIZE}px`;
        div.style.position = 'absolute';
        div.style.top = `${DIV_TOUCH_POS_X}px`;
        div.style.left = `${DIV_TOUCH_POS_Y}px`;
        div.style.zIndex = DIV_TOUCH_ZINDEX.toString();

        this._div = div;
        this._renderer = renderer;

        /**
         * pre-bind the functions
         * @type {Function}
         * @private
         */
        this._onKeyDown = this._onKeyDown.bind(this);

        /**
         * pre-bind the functions
         * @type {Function}
         * @private
         */
        this._onMouseMove = this._onMouseMove.bind(this);

        // let listen for tab.. once pressed we can fire up and show the accessibility layer
        globalThis.addEventListener('keydown', this._onKeyDown, false);
    }

    /**
     * Value of `true` if accessibility is currently active and accessibility layers are showing.
     * @member {boolean}
     * @readonly
     */
    get isActive(): boolean
    {
        return this._isActive;
    }

    /**
     * Value of `true` if accessibility is enabled for touch devices.
     * @member {boolean}
     * @readonly
     */
    get isMobileAccessibility(): boolean
    {
        return this._isMobileAccessibility;
    }

    get hookDiv()
    {
        return this._hookDiv;
    }

    /**
     * Creates the touch hooks.
     * @private
     */
    private _createTouchHook(): void
    {
        const hookDiv = document.createElement('button');

        hookDiv.style.width = `${DIV_HOOK_SIZE}px`;
        hookDiv.style.height = `${DIV_HOOK_SIZE}px`;
        hookDiv.style.position = 'absolute';
        hookDiv.style.top = `${DIV_HOOK_POS_X}px`;
        hookDiv.style.left = `${DIV_HOOK_POS_Y}px`;
        hookDiv.style.zIndex = DIV_HOOK_ZINDEX.toString();
        hookDiv.style.backgroundColor = '#FF0000';
        hookDiv.title = 'select to enable accessibility for this content';

        hookDiv.addEventListener('focus', () =>
        {
            this._isMobileAccessibility = true;
            this._activate();
            this._destroyTouchHook();
        });

        document.body.appendChild(hookDiv);
        this._hookDiv = hookDiv;
    }

    /**
     * Destroys the touch hooks.
     * @private
     */
    private _destroyTouchHook(): void
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
     * @private
     */
    private _activate(): void
    {
        if (this._isActive)
        {
            return;
        }

        this._isActive = true;

        globalThis.document.addEventListener('mousemove', this._onMouseMove, true);
        globalThis.removeEventListener('keydown', this._onKeyDown, false);

        this._renderer.runners.postrender.add(this);
        this._renderer.view.canvas.parentNode?.appendChild(this._div);
    }

    /**
     * Deactivating will cause the Accessibility layer to be hidden.
     * This is called when a user moves the mouse.
     * @private
     */
    private _deactivate(): void
    {
        if (!this._isActive || this._isMobileAccessibility)
        {
            return;
        }

        this._isActive = false;

        globalThis.document.removeEventListener('mousemove', this._onMouseMove, true);
        globalThis.addEventListener('keydown', this._onKeyDown, false);

        this._renderer.runners.postrender.remove(this);
        this._div.parentNode?.removeChild(this._div);
    }

    /**
     * This recursive function will run through the scene graph and add any new accessible objects to the DOM layer.
     * @private
     * @param {Container} container - The Container to check.
     */
    private _updateAccessibleObjects(container: Container): void
    {
        if (!container.visible || !container.accessibleChildren)
        {
            return;
        }

        if (container.accessible && container.isInteractive())
        {
            if (!container._accessibleActive)
            {
                this._addChild(container);
            }

            container._renderId = this._renderId;
        }

        const children = container.children;

        if (children)
        {
            for (let i = 0; i < children.length; i++)
            {
                this._updateAccessibleObjects(children[i] as Container);
            }
        }
    }

    /**
     * Runner init called, view is available at this point.
     * @ignore
     */
    public init(options?: AccessibilityOptions)
    {
        this.debug = options?.debug ?? this.debug;
        this._renderer.runners.postrender.remove(this);
    }

    /**
     * Runner postrender was called, ensure that all divs are mapped correctly to their Containers.
     * Only fires while active.
     * @ignore
     */
    public postrender(): void
    {
        /* On Android default web browser, tab order seems to be calculated by position rather than tabIndex,
        *  moving buttons can cause focus to flicker between two buttons making it hard/impossible to navigate,
        *  so I am just running update every half a second, seems to fix it.
        */
        const now = performance.now();

        if (this._mobileInfo.android.device && now < this._androidUpdateCount)
        {
            return;
        }

        this._androidUpdateCount = now + this._androidUpdateFrequency;

        if (!this._renderer.renderingToScreen || !this._renderer.view.canvas)
        {
            return;
        }

        // update children...
        if (this._renderer.lastObjectRendered)
        {
            this._updateAccessibleObjects(this._renderer.lastObjectRendered as Container);
        }

        const { x, y, width, height } = this._renderer.view.canvas.getBoundingClientRect();
        const { width: viewWidth, height: viewHeight, resolution } = this._renderer;

        const sx = (width / viewWidth) * resolution;
        const sy = (height / viewHeight) * resolution;

        let div = this._div;

        div.style.left = `${x}px`;
        div.style.top = `${y}px`;
        div.style.width = `${viewWidth}px`;
        div.style.height = `${viewHeight}px`;

        for (let i = 0; i < this._children.length; i++)
        {
            const child = this._children[i];

            if (child._renderId !== this._renderId)
            {
                child._accessibleActive = false;

                removeItems(this._children, i, 1);
                this._div.removeChild(child._accessibleDiv);
                this._pool.push(child._accessibleDiv);
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
                    hitArea = child.getBounds().rectangle;

                    this._capHitArea(hitArea);

                    div.style.left = `${hitArea.x * sx}px`;
                    div.style.top = `${hitArea.y * sy}px`;

                    div.style.width = `${hitArea.width * sx}px`;
                    div.style.height = `${hitArea.height * sy}px`;

                    // update button titles and hints if they exist and they've changed
                    if (div.title !== child.accessibleTitle && child.accessibleTitle !== null)
                    {
                        div.title = child.accessibleTitle || '';
                    }
                    if (div.getAttribute('aria-label') !== child.accessibleHint
                        && child.accessibleHint !== null)
                    {
                        div.setAttribute('aria-label', child.accessibleHint || '');
                    }
                }

                // the title or index may have changed, if so lets update it!
                if (child.accessibleTitle !== div.title || child.tabIndex !== div.tabIndex)
                {
                    div.title = child.accessibleTitle || '';
                    div.tabIndex = child.tabIndex;
                    if (this.debug)
                    {
                        this._updateDebugHTML(div);
                    }
                }
            }
        }

        // increment the render id..
        this._renderId++;
    }

    /**
     * private function that will visually add the information to the
     * accessibility div
     * @param {HTMLElement} div -
     */
    private _updateDebugHTML(div: AccessibleHTMLElement): void
    {
        div.innerHTML = `type: ${div.type}</br> title : ${div.title}</br> tabIndex: ${div.tabIndex}`;
    }

    /**
     * Adjust the hit area based on the bounds of a display object
     * @param {Rectangle} hitArea - Bounds of the child
     */
    private _capHitArea(hitArea: Rectangle): void
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

        const { width: viewWidth, height: viewHeight } = this._renderer;

        if (hitArea.x + hitArea.width > viewWidth)
        {
            hitArea.width = viewWidth - hitArea.x;
        }

        if (hitArea.y + hitArea.height > viewHeight)
        {
            hitArea.height = viewHeight - hitArea.y;
        }
    }

    /**
     * Adds a Container to the accessibility manager
     * @private
     * @param {Container} container - The child to make accessible.
     */
    private _addChild<T extends Container>(container: T): void
    {
        //    this.activate();

        let div = this._pool.pop();

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
            if (navigator.userAgent.toLowerCase().includes('chrome'))
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
        div.style.pointerEvents = container.accessiblePointerEvents;
        // set the type, this defaults to button!
        div.type = container.accessibleType;

        if (container.accessibleTitle && container.accessibleTitle !== null)
        {
            div.title = container.accessibleTitle;
        }
        else if (!container.accessibleHint
            || container.accessibleHint === null)
        {
            div.title = `container ${container.tabIndex}`;
        }

        if (container.accessibleHint
            && container.accessibleHint !== null)
        {
            div.setAttribute('aria-label', container.accessibleHint);
        }

        if (this.debug)
        {
            this._updateDebugHTML(div);
        }

        container._accessibleActive = true;
        container._accessibleDiv = div;
        div.container = container;

        this._children.push(container);
        this._div.appendChild(container._accessibleDiv);
        container._accessibleDiv.tabIndex = container.tabIndex;
    }

    /**
     * Dispatch events with the EventSystem.
     * @param e
     * @param type
     * @private
     */
    private _dispatchEvent(e: UIEvent, type: string[]): void
    {
        const { container: target } = e.target as AccessibleHTMLElement;
        const boundary = this._renderer.events.rootBoundary;
        const event: FederatedEvent = Object.assign(new FederatedEvent(boundary), { target });

        boundary.rootTarget = this._renderer.lastObjectRendered as Container;
        type.forEach((type) => boundary.dispatchEvent(event, type));
    }

    /**
     * Maps the div button press to pixi's EventSystem (click)
     * @private
     * @param {MouseEvent} e - The click event.
     */
    private _onClick(e: MouseEvent): void
    {
        this._dispatchEvent(e, ['click', 'pointertap', 'tap']);
    }

    /**
     * Maps the div focus events to pixi's EventSystem (mouseover)
     * @private
     * @param {FocusEvent} e - The focus event.
     */
    private _onFocus(e: FocusEvent): void
    {
        if (!(e.target as Element).getAttribute('aria-live'))
        {
            (e.target as Element).setAttribute('aria-live', 'assertive');
        }

        this._dispatchEvent(e, ['mouseover']);
    }

    /**
     * Maps the div focus events to pixi's EventSystem (mouseout)
     * @private
     * @param {FocusEvent} e - The focusout event.
     */
    private _onFocusOut(e: FocusEvent): void
    {
        if (!(e.target as Element).getAttribute('aria-live'))
        {
            (e.target as Element).setAttribute('aria-live', 'polite');
        }

        this._dispatchEvent(e, ['mouseout']);
    }

    /**
     * Is called when a key is pressed
     * @private
     * @param {KeyboardEvent} e - The keydown event.
     */
    private _onKeyDown(e: KeyboardEvent): void
    {
        if (e.keyCode !== KEY_CODE_TAB)
        {
            return;
        }

        this._activate();
    }

    /**
     * Is called when the mouse moves across the renderer element
     * @private
     * @param {MouseEvent} e - The mouse event.
     */
    private _onMouseMove(e: MouseEvent): void
    {
        if (e.movementX === 0 && e.movementY === 0)
        {
            return;
        }

        this._deactivate();
    }

    /** Destroys the accessibility manager */
    public destroy(): void
    {
        this._destroyTouchHook();
        this._div = null;

        globalThis.document.removeEventListener('mousemove', this._onMouseMove, true);
        globalThis.removeEventListener('keydown', this._onKeyDown);

        this._pool = null;
        this._children = null;
        this._renderer = null;
    }
}
