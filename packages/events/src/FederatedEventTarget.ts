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

/**
 * @memberof PIXI
 */
export interface IHitArea {
    /** Hit-tests whether (x,y) lies in this area. */
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
    interactive: false,
    interactiveChildren: false,
    hitArea: null,

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

    dispatchEvent(e: Event): boolean
    {
        if (!(e instanceof FederatedEvent))
        {
            throw new Error('DisplayObject cannot propagate events outside of the Federated Events API');
        }

        e.manager.dispatchEvent(e);

        return e.defaultPrevented;
    }
};

DisplayObject.mixin(FederatedDisplayObject);
