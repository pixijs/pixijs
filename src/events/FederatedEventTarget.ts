import { EventSystem } from './EventSystem';
import { FederatedEvent } from './FederatedEvent';

import type EventEmitter from 'eventemitter3';
import type { Container } from '../scene/container/Container';
import type { AllFederatedEventMap } from './FederatedEventMap';
import type { FederatedPointerEvent } from './FederatedPointerEvent';
import type { FederatedWheelEvent } from './FederatedWheelEvent';

/**
 * The type of cursor to use when the mouse pointer is hovering over.
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/cursor
 *
 * Can be any valid CSS cursor value:
 * `auto`, `default`, `none`, `context-menu`, `help`, `pointer`, `progress`,
 * `wait`, `cell`, `crosshair`, `text`, `verticaltext`, `alias`, `copy`, `move`,
 * `nodrop`, `notallowed`, `eresize`, `nresize`, `neresize`, `nwresize`, `sresize`,
 *  `seresize`, `swresize`, `wresize`, `nsresize`, `ewresize`, `neswresize`, `colresize`,
 *  `nwseresize`, `rowresize`, `allscroll`, `zoomin`, `zoomout`, `grab`, `grabbing`
 * @category events
 */
export type Cursor = 'auto'
| 'default'
| 'none'
| 'context-menu'
| 'help'
| 'pointer'
| 'progress'
| 'wait'
| 'cell'
| 'crosshair'
| 'text'
| 'vertical-text'
| 'alias'
| 'copy'
| 'move'
| 'no-drop'
| 'not-allowed'
| 'e-resize'
| 'n-resize'
| 'ne-resize'
| 'nw-resize'
| 's-resize'
| 'se-resize'
| 'sw-resize'
| 'w-resize'
| 'ns-resize'
| 'ew-resize'
| 'nesw-resize'
| 'col-resize'
| 'nwse-resize'
| 'row-resize'
| 'all-scroll'
| 'zoom-in'
| 'zoom-out'
| 'grab'
| 'grabbing';

/**
 * The hit area specifies the area for which pointer events should be captured by this event target.
 * @category events
 */
export interface IHitArea
{
    /**
     * Checks if the x and y coordinates given are contained within this hit area.
     * @returns Whether the x and y coordinates are contained within this hit area.
     */
    contains(x: number, y: number): boolean;
}

/**
 * Function type for handlers, e.g., onclick
 * @category events
 */
export type FederatedEventHandler<T = FederatedPointerEvent> = (event: T) => void;

/**
 * The type of interaction a Container can be.
 * This is the {@link Container#eventMode|Container.eventMode} property of any {@link Container}.
 *
 * Can be one of the following:
 * - `'none'`: Ignores all interaction events, even on its children.
 * - `'passive'`: **(default)** Does not emit events and ignores all hit testing on itself and non-interactive children.
 * Interactive children will still emit events.
 * - `'auto'`: Does not emit events but is hit tested if parent is interactive. Same as `interactive = false` in v7
 * - `'static'`: Emit events and is hit tested. Same as `interaction = true` in v7
 * - `'dynamic'`: Emits events and is hit tested but will also receive mock interaction events fired from a ticker to
 * allow for interaction when the mouse isn't moving
 *
 * `none` and `passive` are useful for optimizing interaction events on objects as it reduces the number of hit tests
 * PixiJS has to do. `auto` is useful for when you want to recreate how the DOM handles interaction events with
 * `pointer-events: auto`.
 * @since 7.2.0
 * @category events
 */
export type EventMode = 'none' | 'passive' | 'auto' | 'static' | 'dynamic';

/**
 * The properties available for any interactive object.
 * @category events
 */
export interface FederatedOptions
{
    /** The cursor preferred when the mouse pointer is hovering over. */
    cursor?: Cursor | (string & {});
    /**
     * Enable interaction events for the Container. Touch, pointer and mouse.
     * There are 5 types of interaction settings:
     * - `'none'`: Ignores all interaction events, even on its children.
     * - `'passive'`: **(default)** Does not emit events and ignores all hit testing on itself and non-interactive children.
     * Interactive children will still emit events.
     * - `'auto'`: Does not emit events but is hit tested if parent is interactive. Same as `interactive = false` in v7
     * - `'static'`: Emit events and is hit tested. Same as `interaction = true` in v7
     * - `'dynamic'`: Emits events and is hit tested but will also receive mock interaction events fired from a ticker to
     * allow for interaction when the mouse isn't moving
     * @example
     * import { Sprite } from 'pixi.js';
     *
     * const sprite = new Sprite(texture);
     * sprite.eventMode = 'static';
     * sprite.on('tap', (event) => {
     *     // Handle event
     * });
     * @since 7.2.0
     */
    eventMode?: EventMode;
    /** Whether this event target should fire UI events. */
    interactive?: boolean
    /**
     * Determines if the children to the container can be clicked/touched
     * Setting this to false allows PixiJS to bypass a recursive `hitTest` function
     */
    interactiveChildren?: boolean;
    /**
     * Interaction shape. Children will be hit first, then this shape will be checked.
     * Setting this will cause this shape to be checked in hit tests rather than the container's bounds.
     * @example
     * import { Rectangle, Sprite } from 'pixi.js';
     *
     * const sprite = new Sprite(texture);
     * sprite.interactive = true;
     * sprite.hitArea = new Rectangle(0, 0, 100, 100);
     */
    hitArea?: IHitArea | null;

    /**
     * Property-based event handler for the `click` event.#
     * @default null
     * @example
     * this.onclick = (event) => {
     *  //some function here that happens on click
     * }
     */
    onclick?: FederatedEventHandler | null;

    /**
     * Property-based event handler for the `mousedown` event.#
     * @default null
     * @example
     * this.onmousedown = (event) => {
     *  //some function here that happens on mousedown
     * }
     */
    onmousedown?: FederatedEventHandler | null;

    /**
     * Property-based event handler for the `mouseenter` event.#
     * @default null
     * @example
     * this.onmouseenter = (event) => {
     *  //some function here that happens on mouseenter
     * }
     */
    onmouseenter?: FederatedEventHandler | null;

    /**
     * Property-based event handler for the `mouseleave` event.#
     * @default null
     * @example
     * this.onmouseleave = (event) => {
     *  //some function here that happens on mouseleave
     * }
     */
    onmouseleave?: FederatedEventHandler | null;

    /**
     * Property-based event handler for the `mousemove` event.#
     * @default null
     * @example
     * this.onmousemove = (event) => {
     *  //some function here that happens on mousemove
     * }
     */
    onmousemove?: FederatedEventHandler | null;

    /**
     * Property-based event handler for the `globalmousemove` event.#
     * @default null
     * @example
     * this.onglobalmousemove = (event) => {
     *  //some function here that happens on globalmousemove
     * }
     */
    onglobalmousemove?: FederatedEventHandler | null;

    /**
     * Property-based event handler for the `mouseout` event.#
     * @default null
     * @example
     * this.onmouseout = (event) => {
     *  //some function here that happens on mouseout
     * }
     */
    onmouseout?: FederatedEventHandler | null;

    /**
     * Property-based event handler for the `mouseover` event.#
     * @default null
     * @example
     * this.onmouseover = (event) => {
     *  //some function here that happens on mouseover
     * }
     */
    onmouseover?: FederatedEventHandler | null;

    /**
     * Property-based event handler for the `mouseup` event.#
     * @default null
     * @example
     * this.onmouseup = (event) => {
     *  //some function here that happens on mouseup
     * }
     */
    onmouseup?: FederatedEventHandler | null;

    /**
     * Property-based event handler for the `mouseupoutside` event.#
     * @default null
     * @example
     * this.onmouseupoutside = (event) => {
     *  //some function here that happens on mouseupoutside
     * }
     */
    onmouseupoutside?: FederatedEventHandler | null;

    /**
     * Property-based event handler for the `pointercancel` event.#
     * @default null
     * @example
     * this.onpointercancel = (event) => {
     *  //some function here that happens on pointercancel
     * }
     */
    onpointercancel?: FederatedEventHandler | null;

    /**
     * Property-based event handler for the `pointerdown` event.#
     * @default null
     * @example
     * this.onpointerdown = (event) => {
     *  //some function here that happens on pointerdown
     * }
     */
    onpointerdown?: FederatedEventHandler | null;

    /**
     * Property-based event handler for the `pointerenter` event.#
     * @default null
     * @example
     * this.onpointerenter = (event) => {
     *  //some function here that happens on pointerenter
     * }
     */
    onpointerenter?: FederatedEventHandler | null;

    /**
     * Property-based event handler for the `pointerleave` event.#
     * @default null
     * @example
     * this.onpointerleave = (event) => {
     *  //some function here that happens on pointerleave
     * }
     */
    onpointerleave?: FederatedEventHandler | null;

    /**
     * Property-based event handler for the `pointermove` event.#
     * @default null
     * @example
     * this.onpointermove = (event) => {
     *  //some function here that happens on pointermove
     * }
     */
    onpointermove?: FederatedEventHandler | null;

    /**
     * Property-based event handler for the `globalpointermove` event.#
     * @default null
     * @example
     * this.onglobalpointermove = (event) => {
     *  //some function here that happens on globalpointermove
     * }
     */
    onglobalpointermove?: FederatedEventHandler | null;

    /**
     * Property-based event handler for the `pointerout` event.#
     * @default null
     * @example
     * this.onpointerout = (event) => {
     *  //some function here that happens on pointerout
     * }
     */
    onpointerout?: FederatedEventHandler | null;

    /**
     * Property-based event handler for the `pointerover` event.#
     * @default null
     * @example
     * this.onpointerover = (event) => {
     *  //some function here that happens on pointerover
     * }
     */
    onpointerover?: FederatedEventHandler | null;

    /**
     * Property-based event handler for the `pointertap` event.#
     * @default null
     * @example
     * this.onpointertap = (event) => {
     *  //some function here that happens on pointertap
     * }
     */
    onpointertap?: FederatedEventHandler | null;

    /**
     * Property-based event handler for the `pointerup` event.#
     * @default null
     * @example
     * this.onpointerup = (event) => {
     *  //some function here that happens on pointerup
     * }
     */
    onpointerup?: FederatedEventHandler | null;

    /**
     * Property-based event handler for the `pointerupoutside` event.#
     * @default null
     * @example
     * this.onpointerupoutside = (event) => {
     *  //some function here that happens on pointerupoutside
     * }
     */
    onpointerupoutside?: FederatedEventHandler | null;

    /**
     * Property-based event handler for the `rightclick` event.#
     * @default null
     * @example
     * this.onrightclick = (event) => {
     *  //some function here that happens on rightclick
     * }
     */
    onrightclick?: FederatedEventHandler | null;

    /**
     * Property-based event handler for the `rightdown` event.#
     * @default null
     * @example
     * this.onrightdown = (event) => {
     *  //some function here that happens on rightdown
     * }
     */
    onrightdown?: FederatedEventHandler | null;

    /**
     * Property-based event handler for the `rightup` event.#
     * @default null
     * @example
     * this.onrightup = (event) => {
     *  //some function here that happens on rightup
     * }
     */
    onrightup?: FederatedEventHandler | null;

    /**
     * Property-based event handler for the `rightupoutside` event.#
     * @default null
     * @example
     * this.onrightupoutside = (event) => {
     *  //some function here that happens on rightupoutside
     * }
     */
    onrightupoutside?: FederatedEventHandler | null;

    /**
     * Property-based event handler for the `tap` event.#
     * @default null
     * @example
     * this.ontap = (event) => {
     *  //some function here that happens on tap
     * }
     */
    ontap?: FederatedEventHandler | null;

    /**
     * Property-based event handler for the `touchcancel` event.#
     * @default null
     * @example
     * this.ontouchcancel = (event) => {
     *  //some function here that happens on touchcancel
     * }
     */
    ontouchcancel?: FederatedEventHandler | null;

    /**
     * Property-based event handler for the `touchend` event.#
     * @default null
     * @example
     * this.ontouchend = (event) => {
     *  //some function here that happens on touchend
     * }
     */
    ontouchend?: FederatedEventHandler | null;

    /**
     * Property-based event handler for the `touchendoutside` event.#
     * @default null
     * @example
     * this.ontouchendoutside = (event) => {
     *  //some function here that happens on touchendoutside
     * }
     */
    ontouchendoutside?: FederatedEventHandler | null;

    /**
     * Property-based event handler for the `touchmove` event.#
     * @default null
     * @example
     * this.ontouchmove = (event) => {
     *  //some function here that happens on touchmove
     * }
     */
    ontouchmove?: FederatedEventHandler | null;

    /**
     * Property-based event handler for the `globaltouchmove` event.#
     * @default null
     * @example
     * this.onglobaltouchmove = (event) => {
     *  //some function here that happens on globaltouchmove
     * }
     */
    onglobaltouchmove?: FederatedEventHandler | null;

    /**
     * Property-based event handler for the `touchstart` event.#
     * @default null
     * @example
     * this.ontouchstart = (event) => {
     *  //some function here that happens on touchstart
     * }
     */
    ontouchstart?: FederatedEventHandler | null;

    /**
     * Property-based event handler for the `wheel` event.#
     * @default null
     * @example
     * this.onwheel = (event) => {
     *  //some function here that happens on wheel
     * }
     */
    onwheel?: FederatedEventHandler<FederatedWheelEvent> | null;
}

/**
 * The options for the `addEventListener` method.
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener}
 * @category events
 */
export type AddListenerOptions = boolean | AddEventListenerOptions;
/**
 * The options for the `removeEventListener` method.
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/removeEventListener}
 * @category events
 */
export type RemoveListenerOptions = boolean | EventListenerOptions;

/**
 * Additional properties for a Container that is used for interaction events.
 * @category events
 */
export interface IFederatedContainer extends FederatedOptions
{
    /** The parent of this event target. */
    readonly parent?: Container;

    /** The children of this event target. */
    readonly children?: ReadonlyArray<Container>;

    /** @private */
    _internalEventMode: EventMode;

    /**
     * Determines if the container is interactive or not
     * @returns {boolean} Whether the container is interactive or not
     * @since 7.2.0
     * @example
     * import { Sprite } from 'pixi.js';
     *
     * const sprite = new Sprite(texture);
     * sprite.eventMode = 'static';
     * sprite.isInteractive(); // true
     *
     * sprite.eventMode = 'dynamic';
     * sprite.isInteractive(); // true
     *
     * sprite.eventMode = 'none';
     * sprite.isInteractive(); // false
     *
     * sprite.eventMode = 'passive';
     * sprite.isInteractive(); // false
     *
     * sprite.eventMode = 'auto';
     * sprite.isInteractive(); // false
     */
    isInteractive: () => boolean;
    /**
     * Unlike `on` or `addListener` which are methods from EventEmitter, `addEventListener`
     * seeks to be compatible with the DOM's `addEventListener` with support for options.
     * @param {any} type - The type of event to listen to.
     * @param {any} listener - The listener callback or object.
     * @param {any} options - Listener options, used for capture phase.
     * @example
     * // Tell the user whether they did a single, double, triple, or nth click.
     * button.addEventListener('click', {
     *     handleEvent(e): {
     *         let prefix;
     *
     *         switch (e.detail) {
     *             case 1: prefix = 'single'; break;
     *             case 2: prefix = 'double'; break;
     *             case 3: prefix = 'triple'; break;
     *             default: prefix = e.detail + 'th'; break;
     *         }
     *
     *         console.log('That was a ' + prefix + 'click');
     *     }
     * });
     *
     * // But skip the first click!
     * button.parent.addEventListener('click', function blockClickOnce(e) {
     *     e.stopImmediatePropagation();
     *     button.parent.removeEventListener('click', blockClickOnce, true);
     * }, {
     *     capture: true,
     * });
     */
    addEventListener<K extends keyof AllFederatedEventMap>(
        type: K,
        listener: (e: AllFederatedEventMap[K]) => any,
        options?: AddListenerOptions
    ): void;
    addEventListener(
        type: string,
        listener: EventListenerOrEventListenerObject,
        options?: AddListenerOptions
    ): void;
    /**
     * Unlike `off` or `removeListener` which are methods from EventEmitter, `removeEventListener`
     * seeks to be compatible with the DOM's `removeEventListener` with support for options.
     * @param {K} type - The type of event the listener is bound to.
     * @param {any} listener - The listener callback or object.
     * @param {RemoveListenerOptions} options - The original listener options.
     * This is required to deregister a capture phase listener.
     */
    removeEventListener<K extends keyof AllFederatedEventMap>(
        type: K,
        listener: (e: AllFederatedEventMap[K]) => any,
        options?: RemoveListenerOptions
    ): void;
    removeEventListener(
        type: string,
        listener: EventListenerOrEventListenerObject,
        options?: RemoveListenerOptions
    ): void;
    /**
     * Dispatch the event on this {@link Container} using the event's {@link EventBoundary}.
     *
     * The target of the event is set to `this` and the `defaultPrevented` flag is cleared before dispatch.
     * @param {FederatedEvent} e - The event to dispatch.
     * @returns Whether the {@link FederatedEvent.preventDefault preventDefault}() method was not invoked.
     * @example
     * // Reuse a click event!
     * button.dispatchEvent(clickEvent);
     */
    dispatchEvent(e: FederatedEvent): boolean;
}

/** @internal */
export const FederatedContainer: IFederatedContainer = {
    onclick: null,
    onmousedown: null,
    onmouseenter: null,
    onmouseleave: null,
    onmousemove: null,
    onglobalmousemove: null,
    onmouseout: null,
    onmouseover:  null,
    onmouseup:  null,
    onmouseupoutside: null,
    onpointercancel: null,
    onpointerdown:  null,
    onpointerenter: null,
    onpointerleave:  null,
    onpointermove:  null,
    onglobalpointermove:  null,
    onpointerout:  null,
    onpointerover:  null,
    onpointertap:  null,
    onpointerup:  null,
    onpointerupoutside:  null,
    onrightclick:  null,
    onrightdown:  null,
    onrightup:  null,
    onrightupoutside:  null,
    ontap:  null,
    ontouchcancel:  null,
    ontouchend:  null,
    ontouchendoutside:  null,
    ontouchmove:  null,
    onglobaltouchmove:  null,
    ontouchstart:  null,
    onwheel:  null,
    get interactive()
    {
        return this.eventMode === 'dynamic' || this.eventMode === 'static';
    },
    set interactive(value: boolean)
    {
        this.eventMode = value ? 'static' : 'passive';
    },
    _internalEventMode: undefined,
    get eventMode()
    {
        return this._internalEventMode ?? EventSystem.defaultEventMode;
    },
    set eventMode(value)
    {
        this._internalEventMode = value;
    },
    isInteractive(): boolean
    {
        return this.eventMode === 'static' || this.eventMode === 'dynamic';
    },
    interactiveChildren: true,
    hitArea: null,
    addEventListener(
        type: string,
        listener: EventListenerOrEventListenerObject,
        options?: AddListenerOptions
    )
    {
        const capture = (typeof options === 'boolean' && options)
        || (typeof options === 'object' && options.capture);
        const signal = typeof options === 'object' ? options.signal : undefined;
        const once = typeof options === 'object' ? (options.once === true) : false;
        const context = typeof listener === 'function' ? undefined : listener;

        type = capture ? `${type}capture` : type;
        const listenerFn = typeof listener === 'function' ? listener : listener.handleEvent;

        const emitter = (this as unknown as EventEmitter);

        if (signal)
        {
            signal.addEventListener('abort', () =>
            {
                emitter.off(type, listenerFn, context);
            });
        }

        if (once)
        {
            emitter.once(type, listenerFn, context);
        }
        else
        {
            emitter.on(type, listenerFn, context);
        }
    },
    removeEventListener(
        type: string,
        listener: EventListenerOrEventListenerObject,
        options?: RemoveListenerOptions
    )
    {
        const capture = (typeof options === 'boolean' && options)
            || (typeof options === 'object' && options.capture);
        const context = typeof listener === 'function' ? undefined : listener;

        type = capture ? `${type}capture` : type;
        listener = typeof listener === 'function' ? listener : listener.handleEvent;

        (this as unknown as EventEmitter).off(type, listener, context);
    },
    dispatchEvent(e: Event): boolean
    {
        if (!(e instanceof FederatedEvent))
        {
            throw new Error('Container cannot propagate events outside of the Federated Events API');
        }

        e.defaultPrevented = false;
        e.path = null;
        e.target = this as Container;
        e.manager.dispatchEvent(e);

        return !e.defaultPrevented;
    }
};
