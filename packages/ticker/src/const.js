/**
 * Represents the update priorities used by internal PIXI classes when registered with
 * the {@link PIXI.ticker.Ticker} object. Higher priority items are updated first and lower
 * priority items, such as render, should go later.
 *
 * @static
 * @constant
 * @name UPDATE_PRIORITY
 * @memberof PIXI.ticker
 * @type {object}
 * @property {number} INTERACTION=50 Highest priority, used for {@link PIXI.interaction.InteractionManager}
 * @property {number} HIGH=25 High priority updating, {@link PIXI.VideoBaseTexture} and {@link PIXI.AnimatedSprite}
 * @property {number} NORMAL=0 Default priority for ticker events, see {@link PIXI.ticker.Ticker#add}.
 * @property {number} LOW=-25 Low priority used for {@link PIXI.Application} rendering.
 * @property {number} UTILITY=-50 Lowest priority used for {@link PIXI.prepare.BasePrepare} utility.
 */
export const UPDATE_PRIORITY = {
    INTERACTION: 50,
    HIGH: 25,
    NORMAL: 0,
    LOW: -25,
    UTILITY: -50,
};
