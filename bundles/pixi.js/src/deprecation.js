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
}
