/**
 * Represents the update priorities used by internal Pixi classes when registered with
 * the {@link ticker.Ticker} object. Higher priority items are updated first and lower
 * priority items, such as render, should go later.
 * @static
 * @enum {number}
 * @memberof ticker
 */
export enum UPDATE_PRIORITY
{
    /**
     * Highest priority used for interaction events in {@link EventSystem}
     * @default 50
     */
    INTERACTION = 50,
    /**
     * High priority updating, used by {@link AnimatedSprite}
     * @default 25
     */
    HIGH = 25,
    /**
     * Default priority for ticker events, see {@link Ticker#add}.
     * @default 0
     */
    NORMAL = 0,
    /**
     * Low priority used for {@link Application} rendering.
     * @default -25
     */
    LOW = -25,
    /**
     * Lowest priority used for {@link BasePrepare} utility.
     * @default -50
     */
    UTILITY = -50,
}
