import { DisplayObject } from '@pixi/display';
import { FederatedEvent } from './FederatedEvent';

import type { EventEmitter } from '@pixi/utils';

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

// @ignore - This is documented elsewhere.
export interface IHitArea {
    contains(x: number, y: number): boolean;
}

/**
 * Describes the shape for a {@link FederatedEvent}'s' `eventTarget`.
 *
 * @memberof PIXI
 */
export interface FederatedEventTarget extends EventEmitter, EventTarget {
    /** The cursor preferred when the mouse pointer is hovering over. */
    readonly cursor?: Cursor;

    /** The parent of this event target. */
    readonly parent?: FederatedEventTarget;

    /** The children of this event target. */
    readonly children?: ReadonlyArray<FederatedEventTarget>;

    /** Whether this event target should fire UI events. */
    interactive: boolean;

    /**
     * Whether this event target has any children that need UI events. This can be used optimize
     * event propagation.
     */
    interactiveChildren: boolean;

    /** The hit-area specifies the area for which pointer events should be captured by this event target. */
    hitArea: IHitArea;
}

export const FederatedDisplayObject: Omit<
    FederatedEventTarget,
    'parent' | 'children' | keyof EventEmitter
> = {
    /**
     * Enable interaction events for the DisplayObject. Touch, pointer and mouse
     * events will not be emitted unless `interactive` is set to `true`.
     *
     * @example
     * const sprite = new PIXI.Sprite(texture);
     * sprite.interactive = true;
     * sprite.on('tap', (event) => {
     *    //handle event
     * });
     * @memberof PIXI.DisplayObject#
     */
    interactive: false,

    /**
     * Determines if the children to the displayObject can be clicked/touched
     * Setting this to false allows PixiJS to bypass a recursive `hitTest` function
     *
     * @memberof PIXI.Container#
     */
    interactiveChildren: true,

    /**
     * Interaction shape. Children will be hit first, then this shape will be checked.
     * Setting this will cause this shape to be checked in hit tests rather than the displayObject's bounds.
     *
     * @example
     * const sprite = new PIXI.Sprite(texture);
     * sprite.interactive = true;
     * sprite.hitArea = new PIXI.Rectangle(0, 0, 100, 100);
     * @member {PIXI.IHitArea}
     * @memberof PIXI.DisplayObject#
     */
    hitArea: null,

    /**
     * @memberof PIXI.DisplayObject
     * @param type - The type of event to listen to.
     * @param listener - The listener callback or object.
     * @param options - Listener options, used for capture phase.
     * @example
     * // Tell the user whether they did a single, double, triple, or nth click.
     * button.addEventListener('click', {
     *   handleEvent(e): {
     *     let prefix;
     *
     *     switch (e.detail) {
     *       case 1: prefix = 'single'; break;
     *       case 2: prefix = 'double'; break;
     *       case 3: prefix = 'triple'; break;
     *       default: prefix = e.detail + 'th'; break;
     *     }
     *
     *     console.log('That was a ' + prefix + 'click');
     *   }
     * });
     *
     * // But skip the first click!
     * button.parent.addEventListener('click', function blockClickOnce(e) {
     *   e.stopImmediatePropagation();
     *   button.parent.removeEventListener('click', blockClickOnce, true);
     * }, {
     *   capture: true,
     * })
     */
    addEventListener(
        type: string,
        listener: EventListenerOrEventListenerObject,
        options?: boolean | AddEventListenerOptions,
    )
    {
        const capture = (typeof options === 'boolean' && options)
            || (typeof options === 'object' && options.capture);
        const context = typeof listener === 'function' ? undefined : listener;

        type = capture ? `${type}capture` : type;
        listener = typeof listener === 'function' ? listener : listener.handleEvent;

        (this as unknown as EventEmitter).on(type, listener, context);
    },

    /**
     * @memberof PIXI.DisplayObject
     * @param type - The type of event the listener is bound to.
     * @param listener - The listener callback or object.
     * @param options - The original listener options. This is required to deregister a capture phase listener.
     */
    removeEventListener(
        type: string,
        listener: EventListenerOrEventListenerObject,
        options?: boolean | AddEventListenerOptions,
    )
    {
        const capture = (typeof options === 'boolean' && options)
            || (typeof options === 'object' && options.capture);
        const context = typeof listener === 'function' ? undefined : listener;

        type = capture ? `${type}capture` : type;
        listener = typeof listener === 'function' ? listener : listener.handleEvent;

        (this as unknown as EventEmitter).off(type, listener, context);
    },

    /**
     * Dispatch the event on this {@link PIXI.DisplayObject} using the event's {@link PIXI.EventBoundary}.
     *
     * The target of the event is set to `this` and the `defaultPrevented` flag is cleared before dispatch.
     *
     * @memberof PIXI.DisplayObject
     * @param e - The event to dispatch.
     * @return Whether the {@link PIXI.FederatedEvent.preventDefault preventDefault}() method was not invoked.
     * @example
     * // Reuse a click event!
     * button.dispatchEvent(clickEvent);
     */
    dispatchEvent(e: Event): boolean
    {
        if (!(e instanceof FederatedEvent))
        {
            throw new Error('DisplayObject cannot propagate events outside of the Federated Events API');
        }

        e.defaultPrevented = false;
        e.path = null;
        e.target = this as FederatedEventTarget;
        e.manager.dispatchEvent(e);

        return !e.defaultPrevented;
    }
};

DisplayObject.mixin(FederatedDisplayObject);
