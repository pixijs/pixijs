import type { DisplayObject } from '@pixi/display';
import type { InteractionData } from './InteractionData';

export type InteractionCallback = (interactionEvent: InteractionEvent, displayObject: DisplayObject, hit?: boolean) => void;

/**
 * Event class that mimics native DOM events.
 *
 * @memberof PIXI
 */
export class InteractionEvent
{
    /**
     * Whether this event will continue propagating in the tree.
     *
     * Remaining events for the {@link stopsPropagatingAt} object
     * will still be dispatched.
     */
    public stopped: boolean;

    /**
     * At which object this event stops propagating.
     *
     * @private
     */
    public stopsPropagatingAt: DisplayObject;

    /**
     * Whether we already reached the element we want to
     * stop propagating at. This is important for delayed events,
     * where we start over deeper in the tree again.
     *
     * @private
     */
    public stopPropagationHint: boolean;

    /**
     * The object which caused this event to be dispatched.
     * For listener callback see {@link PIXI.InteractionEvent.currentTarget}.
     */
    public target: DisplayObject;

    /** The object whose event listener’s callback is currently being invoked. */
    public currentTarget: DisplayObject;

    /** Type of the event. */
    public type: string;

    /** {@link InteractionData} related to this event */
    public data: InteractionData;

    constructor()
    {
        this.stopped = false;
        this.stopsPropagatingAt = null;
        this.stopPropagationHint = false;
        this.target = null;
        this.currentTarget = null;
        this.type = null;
        this.data = null;
    }

    /** Prevents event from reaching any objects other than the current object. */
    public stopPropagation(): void
    {
        this.stopped = true;
        this.stopPropagationHint = true;
        this.stopsPropagatingAt = this.currentTarget;
    }

    /** Resets the event. */
    public reset(): void
    {
        this.stopped = false;
        this.stopsPropagatingAt = null;
        this.stopPropagationHint = false;
        this.currentTarget = null;
        this.target = null;
    }
}
