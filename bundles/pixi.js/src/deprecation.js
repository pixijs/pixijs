import { deprecationWarn as warn } from '@pixi/utils';
import { UPDATE_PRIORITY } from '@pixi/ticker';

/**
 * Internal deprecations
 * @private
 */
export function deprecation(PIXI)
{
    /**
     * @deprecated since 5.0.0
     * @see PIXI.ticker.UPDATE_PRIORITY
     * @static
     * @constant
     * @name UPDATE_PRIORITY
     * @memberof PIXI
     * @type {object}
     */
    Object.defineProperties(PIXI, {
        UPDATE_PRIORITY: {
            get()
            {
                warn('PIXI.UPDATE_PRIORITY has moved to PIXI.ticker.UPDATE_PRIORITY');

                return UPDATE_PRIORITY;
            },
        },
    });

    /**
     * This namespace has been removed. All classes previous nested
     * under this namespace have been moved to the top-level `PIXI` object.
     * @namespace PIXI.extras
     * @deprecated since 5.0.0
     */
    PIXI.extras = {};

    Object.defineProperties(PIXI.extras, {
        /**
         * @class PIXI.extras.TilingSprite
         * @see PIXI.TilingSprite
         * @deprecated since 5.0.0
         */
        TilingSprite: {
            get()
            {
                warn('PIXI.extras.TilingSprite has moved to PIXI.TilingSprite');

                return PIXI.TilingSprite;
            },
        },
        /**
         * @class PIXI.extras.TilingSpriteRenderer
         * @see PIXI.TilingSpriteRenderer
         * @deprecated since 5.0.0
         */
        TilingSpriteRenderer: {
            get()
            {
                warn('PIXI.extras.TilingSpriteRenderer has moved to PIXI.TilingSpriteRenderer');

                return PIXI.TilingSpriteRenderer;
            },
        },
        /**
         * @class PIXI.extras.AnimatedSprite
         * @see PIXI.AnimatedSprite
         * @deprecated since 5.0.0
         */
        AnimatedSprite: {
            get()
            {
                warn('PIXI.extras.AnimatedSprite has moved to PIXI.AnimatedSprite');

                return PIXI.AnimatedSprite;
            },
        },
        /**
         * @class PIXI.extras.BitmapText
         * @see PIXI.BitmapText
         * @deprecated since 5.0.0
         */
        BitmapText: {
            get()
            {
                warn('PIXI.extras.BitmapText has moved to PIXI.BitmapText');

                return PIXI.BitmapText;
            },
        },
    });
}
