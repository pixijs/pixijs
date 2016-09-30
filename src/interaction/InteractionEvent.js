/**
 * Event class that mimics native DOM events.
 *
 * @class
 * @memberof PIXI.interaction
 */
export default class InteractionEvent
{
    /**
     *
     */
    constructor()
    {
        /**
         * Which this event will continue propagating in the tree
         *
         * @member {boolean}
         */
        this.stopped = false;

        /**
         * The object to which event is dispatched.
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

        /*
         * Type of the event
         *
         * @member {string}
         */
        this.type = null;

        /*
         * InteractionData related to this event
         *
         * @member {PIXI.interaction.InteractionData}
         */
        this.data = null;
    }

    /**
     * Prevents event from reaching any objects other than the current object.
     *
     */
    stopPropagation()
    {
        this.stopped = true;
    }

    /**
     * Prevents event from reaching any objects other than the current object.
     *
     * @private
     */
    _reset()
    {
        this.stopped = false;
        this.currentTarget = null;
        this.target = null;
    }
}
