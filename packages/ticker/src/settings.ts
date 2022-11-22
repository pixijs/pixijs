import { settings } from '@pixi/settings';
import { deprecation } from '@pixi/utils';
import { Ticker } from './Ticker';

Object.defineProperties(settings, {
    /**
     * Target frames per millisecond.
     * @static
     * @name TARGET_FPMS
     * @memberof PIXI.settings
     * @type {number}
     * @deprecated since 7.1.0
     * @see PIXI.Ticker.defaultTargetFPMS
     */
    TARGET_FPMS: {
        get()
        {
            return Ticker.defaultTargetFPMS;
        },
        set(value: number)
        {
            // #if _DEBUG
            deprecation('7.1.0', 'settings.TARGET_FPMS is deprecated, use Ticker.defaultTargetFPMS');
            // #endif

            Ticker.defaultTargetFPMS = value;
        },
    },
});

export { settings };
