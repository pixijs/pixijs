import type { DisplayObject } from '@pixi/display';
import type { InteractionData } from './InteractionData';

export type InteractionCallback = (interactionEvent: InteractionEvent, displayObject: DisplayObject, hit?: boolean) => void;

/**
 * Event class that mimics native DOM events.
 *
 * @class
 * @memberof PIXI
 */
export class InteractionEvent
{
    public stopped: boolean;
    public stopsPropagatingAt: DisplayObject;
    public stopPropagationHint: boolean;
    public target: DisplayObject;
    public currentTarget: DisplayObject;
    public type: string;
    public data: InteractionData;

    constructor()
    {
        /**
         * Whether this event will continue propagating in the tree.
         *
         * Remaining events for the {@link stopsPropagatingAt} object
         * will still be dispatched.
         *
         * @member {boolean}
         */
        this.stopped = false;

        /**
         * At which object this event stops propagating.
         *
         * @private
         * @member {PIXI.DisplayObject}
         */
        this.stopsPropagatingAt = null;

        /**
         * Whether we already reached the element we want to
         * stop propagating at. This is important for delayed events,
         * where we start over deeper in the tree again.
         *
         * @private
         * @member {boolean}
         */
        this.stopPropagationHint = false;

        /**
         * The object which caused this event to be dispatched.
         * For listener callback see {@link PIXI.InteractionEvent.currentTarget}.
         *
         * @member {PIXI.DisplayObject}
         */
        this.target = null;

        /**
         * The object whose event listener’s callback is currently being invoked.
         *
         * @member {PIXI.DisplayObject}
         */
        this.currentTarget = null;

        /**
         * Type of the event
         *
         * @member {string}
         */
        this.type = null;

        /**
         * InteractionData related to this event
         *
         * @member {PIXI.InteractionData}
         */
        this.data = null;
    }

    /**
     * Prevents event from reaching any objects other than the current object.
     *
     */
    public stopPropagation(): void
    {
        this.stopped = true;
        this.stopPropagationHint = true;
        this.stopsPropagatingAt = this.currentTarget;
    }

    /**
     * Resets the event.
     */
    public reset(): void
    {
        this.stopped = false;
        this.stopsPropagatingAt = null;
        this.stopPropagationHint = false;
        this.currentTarget = null;
        this.target = null;
    }
}
